import os
import joblib
import warnings
import numpy as np
import pandas as pd
import xgboost as xgb
from .feature_engineering import add_semiconductor_features, FEATURE_COLUMNS
from .schemas import WaferPredictRequest, WaferPredictResponse, WaferPrediction, SHAPDriver

warnings.filterwarnings("ignore", category=UserWarning, module="xgboost")

class WaferRiskPredictor:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, model_dir=os.path.dirname(__file__)):
        self.model_path = os.path.join(model_dir, "xgboost_wafer_risk.json")
        self.features_path = os.path.join(model_dir, "feature_columns.joblib")
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"ML_MODEL_UNAVAILABLE: Model missing in {model_dir}")
            
        # GPU Support: gracefully fallback if CUDA is unavailable
        try:
            self.model = xgb.XGBClassifier(device="cuda")
            self.model.load_model(self.model_path)
            self.device_used = "gpu"
        except Exception:
            self.model = xgb.XGBClassifier(device="cpu")
            self.model.load_model(self.model_path)
            self.device_used = "cpu"

        self.booster = self.model.get_booster()
        self.feature_columns = joblib.load(self.features_path)
        
        self.class_names = ["NORMAL", "DRIFT"]
        self.actions = {
            "NORMAL": "PASS",
            "DRIFT": "HOLD / STOP"
        }

    def predict(self, req: WaferPredictRequest) -> WaferPredictResponse:
        # Flatten into the dict expected by feature engineering
        metrology_data = {
            "s1_x_error_px": req.stages.stage_1.x_error_px,
            "s1_y_error_px": req.stages.stage_1.y_error_px,
            "s1_error_px": req.stages.stage_1.overlay_error_px,
            "s1_confidence": req.stages.stage_1.confidence,
            "s1_inlier_ratio": req.stages.stage_1.inlier_ratio,

            "s2_x_error_px": req.stages.stage_2.x_error_px,
            "s2_y_error_px": req.stages.stage_2.y_error_px,
            "s2_error_px": req.stages.stage_2.overlay_error_px,
            "s2_confidence": req.stages.stage_2.confidence,
            "s2_inlier_ratio": req.stages.stage_2.inlier_ratio,

            "s3_x_error_px": req.stages.stage_3.x_error_px,
            "s3_y_error_px": req.stages.stage_3.y_error_px,
            "s3_error_px": req.stages.stage_3.overlay_error_px,
            "s3_confidence": req.stages.stage_3.confidence,
            "s3_inlier_ratio": req.stages.stage_3.inlier_ratio,

            "pre_s4_defect_count": req.defects.pre_s4_defect_count,
            "avg_defect_size": req.defects.avg_defect_size,
            "bridge_defects": req.defects.bridge_defects
        }

        df_input = pd.DataFrame([metrology_data])
        df_feat = add_semiconductor_features(df_input)
        
        X_sample = df_feat[self.feature_columns].values
        
        drift_probability = float(self.model.predict_proba(X_sample)[0][1])
        pred_class_idx = 1 if drift_probability >= 0.5 else 0
        
        risk_label = self.class_names[pred_class_idx]
        recommended_action = self.actions[risk_label]
        
        # Calculate TreeSHAP contributions
        dmat = xgb.DMatrix(X_sample, feature_names=self.feature_columns)
        contribs = self.booster.predict(dmat, pred_contribs=True)[0]
        feature_shap_values = contribs[:-1]
        
        # Sort by absolute contribution to find the top drivers
        top_indices = np.argsort(np.abs(feature_shap_values))[::-1]
        
        shap_drivers = []
        for idx in top_indices:
            shap_val = float(feature_shap_values[idx])
            feat_name = self.feature_columns[idx]
            raw_val = float(df_feat[feat_name].iloc[0])
            
            direction = "increases_risk" if shap_val > 0 else "decreases_risk"
            
            shap_drivers.append(SHAPDriver(
                feature=feat_name,
                value=round(raw_val, 4),
                contribution=round(abs(shap_val), 4),
                direction=direction
            ))
            
            # Keep top 5 drivers
            if len(shap_drivers) >= 5:
                break
                
        # Also return the full feature dictionary
        features_dict = df_feat.iloc[0].to_dict()
        
        return WaferPredictResponse(
            wafer_id=req.wafer_id,
            prediction=WaferPrediction(
                status=risk_label,
                probability=round(drift_probability, 4),
                action=recommended_action
            ),
            features=features_dict,
            shap_drivers=shap_drivers
        )
