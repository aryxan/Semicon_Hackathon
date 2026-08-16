import os
import sys
import yaml
import cv2
import pandas as pd
from pathlib import Path

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.ml_engine.model_server import WaferRiskPredictor
from backend.ml_engine.schemas import WaferPredictRequest, StagesMetrology, StageMetrology, DefectLog
from backend.cv_engine.core import Localizer, load_gray

def run_eval():
    df = pd.read_csv('backend/data/wafer_metrology_history.csv')
    predictor = WaferRiskPredictor(model_dir='backend/ml_engine')
    
    with open('backend/cv_engine/config.yaml') as f:
        cfg = yaml.safe_load(f)
    localizer = Localizer(cfg)
    
    ref_img = load_gray(Path('backend/data/images/000_golden_reference.png'))
    center_pt = (500.0, 500.0)
    
    predictions = []
    actuals = []
    
    grouped = df.groupby('Wafer_ID')
    
    count = 0
    total = len(grouped)
    
    for wafer_id, group in grouped:
        stages = group.to_dict('records')
        if len(stages) < 3: continue
        
        cv_results = []
        for i in range(3):
            search_path = os.path.join('backend/data/images', stages[i]['Search_Image'])
            search_img = load_gray(Path(search_path))
            
            res = localizer.locate(ref_img, search_img, center_pt)
            if res.status == "FAILED" or res.x is None:
                x_err = 0.0
                y_err = 0.0
            else:
                x_err = float(res.x - center_pt[0])
                y_err = float(res.y - center_pt[1])
                
            cv_results.append({
                'x': x_err,
                'y': y_err,
                'overlay': (x_err**2 + y_err**2)**0.5,
                'conf': res.confidence,
                'inlier': res.inlier_ratio
            })
            
        def get_stage(idx):
            return StageMetrology(
                x_error_px=cv_results[idx]['x'],
                y_error_px=cv_results[idx]['y'],
                overlay_error_px=cv_results[idx]['overlay'],
                confidence=cv_results[idx]['conf'],
                inlier_ratio=cv_results[idx]['inlier']
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
            pred_res = predictor.predict(req)
            predictions.append(pred_res.prediction.status)
            
            label = stages[3]['Drift_Risk_Label'] if len(stages) > 3 else stages[-1]['Drift_Risk_Label']
            actual = 'DRIFT' if label in ['WATCH', 'CRITICAL_DRIFT'] else 'NORMAL'
            actuals.append(actual)
        except Exception as e:
            print(f"Error for {wafer_id}: {e}")
            
        count += 1
        print(f"Processed {count} wafers...", flush=True)

    from sklearn.metrics import classification_report, accuracy_score, precision_score
    print("\n--- FINAL EVALUATION WITH REAL OPENCV OPTICAL METRICS ---")
    print("Accuracy: {:.4f}".format(accuracy_score(actuals, predictions)))
    try:
        print("Precision (DRIFT): {:.4f}".format(precision_score(actuals, predictions, pos_label='DRIFT')))
    except:
        pass
    print("\nClassification Report:\n", classification_report(actuals, predictions))

if __name__ == '__main__':
    run_eval()
