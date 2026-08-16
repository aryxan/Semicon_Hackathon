import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
from backend.ml_engine.model_server import WaferRiskPredictor
from backend.ml_engine.schemas import WaferPredictRequest, StagesMetrology, StageMetrology, DefectLog

def run_eval():
    df = pd.read_csv('backend/data/wafer_metrology_history.csv')
    predictor = WaferRiskPredictor(model_dir='backend/ml_engine')
    
    predictions = []
    actuals = []
    
    for wafer_id, group in df.groupby('Wafer_ID'):
        stages = group.to_dict('records')
        if len(stages) < 3: continue
        
        # Use an average or generic value for missing confidence
        def get_stage(idx):
            # simulate confidence drop based on overlay error
            overlay = float(stages[idx]['Overlay_Error_nm'])
            conf = max(0.5, 1.0 - (overlay / 50.0))
            
            return StageMetrology(
                x_error_px=float(stages[idx]['Incremental_dX_nm']),
                y_error_px=float(stages[idx]['Incremental_dY_nm']),
                overlay_error_px=float(stages[idx]['Overlay_Error_nm']),
                confidence=conf,
                inlier_ratio=conf - 0.1
            )
            
        req = WaferPredictRequest(
            wafer_id=wafer_id,
            stages=StagesMetrology(
                stage_1=get_stage(0),
                stage_2=get_stage(1),
                stage_3=get_stage(2)
            ),
            defects=DefectLog(
                pre_s4_defect_count=int(stages[0]['Defect_Count']) + int(stages[1]['Defect_Count']) + int(stages[2]['Defect_Count']),
                avg_defect_size=0.0,
                bridge_defects=0
            )
        )
        
        try:
            res = predictor.predict(req)
            predictions.append(res.prediction.status)
            
            label = stages[3]['Drift_Risk_Label'] if len(stages) > 3 else stages[-1]['Drift_Risk_Label']
            actual = 'DRIFT' if label in ['WATCH', 'CRITICAL_DRIFT'] else 'NORMAL'
            actuals.append(actual)
        except Exception as e:
            pass
            
    from sklearn.metrics import classification_report, accuracy_score, precision_score
    print("Accuracy: {:.4f}".format(accuracy_score(actuals, predictions)))
    try:
        print("Precision (DRIFT): {:.4f}".format(precision_score(actuals, predictions, pos_label='DRIFT')))
    except:
        pass
    print("\nClassification Report:\n", classification_report(actuals, predictions))

if __name__ == '__main__':
    run_eval()
