"""
inference.py
Production Inference Engine using 100% Real CV & Defect features with TreeSHAP.
"""

import os
import joblib
import warnings
import numpy as np
import pandas as pd
import xgboost as xgb
from feature_engineering import add_semiconductor_features

warnings.filterwarnings("ignore", category=UserWarning, module="xgboost")

class WaferRiskPredictor:
    def __init__(self, model_dir="."):
        self.model_path = os.path.join(model_dir, "xgboost_wafer_risk.json")
        self.features_path = os.path.join(model_dir, "feature_columns.joblib")
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model missing in {model_dir}. Run train_xgboost.py first.")
            
        self.model = xgb.XGBClassifier(device="cuda")
        self.model.load_model(self.model_path)
        self.booster = self.model.get_booster()
        self.feature_columns = joblib.load(self.features_path)
        
        self.class_names = ["NORMAL", "DRIFT"]
        self.actions = {
            "NORMAL": "PASS",
            "DRIFT": "HOLD/STOP"
        }
        
    def predict_wafer_risk(self, metrology_data: dict) -> dict:
        default_data = {
            "s1_x_error_px": 0.0, "s1_y_error_px": 0.0, "s1_error_px": 0.0, "s1_confidence": 0.9, "s1_inlier_ratio": 0.8,
            "s2_x_error_px": 0.0, "s2_y_error_px": 0.0, "s2_error_px": 0.0, "s2_confidence": 0.9, "s2_inlier_ratio": 0.8,
            "s3_x_error_px": 0.0, "s3_y_error_px": 0.0, "s3_error_px": 0.0, "s3_confidence": 0.9, "s3_inlier_ratio": 0.8,
            "pre_s4_defect_count": 0, "avg_defect_size": 0.0, "bridge_defects": 0
        }
        
        full_input = {**default_data, **metrology_data}
        wafer_id = full_input.get("wafer_id", "W_INFERENCE")
        
        df_input = pd.DataFrame([full_input])
        df_feat = add_semiconductor_features(df_input)
        
        X_sample = df_feat[self.feature_columns].values
        
        drift_probability = float(self.model.predict_proba(X_sample)[0][1])
        pred_class_idx = 1 if drift_probability >= 0.5 else 0
        
        risk_label = self.class_names[pred_class_idx]
        recommended_action = self.actions[risk_label]
        
        # Calculate TreeSHAP contributions for this wafer
        dmat = xgb.DMatrix(X_sample, feature_names=self.feature_columns)
        contribs = self.booster.predict(dmat, pred_contribs=True)[0]
        feature_shap_values = contribs[:-1]
        
        top_indices = np.argsort(feature_shap_values)[::-1]
        
        top_drivers = []
        for idx in top_indices:
            shap_val = float(feature_shap_values[idx])
            if shap_val <= 0 and len(top_drivers) >= 3:
                break
            feat_name = self.feature_columns[idx]
            raw_val = float(df_feat[feat_name].iloc[0])
            top_drivers.append({
                "feature": feat_name,
                "value": round(raw_val, 4),
                "shap_contribution": round(shap_val, 4)
            })
            if len(top_drivers) >= 4:
                break
            
        return {
            "wafer_id": wafer_id,
            "Drift_Risk_Label": risk_label,
            "drift_probability": round(drift_probability, 4),
            "recommended_action": recommended_action,
            "top_risk_drivers": top_drivers
        }
