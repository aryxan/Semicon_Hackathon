import os
import pandas as pd
from ml_engine.model_server import WaferRiskPredictor
from ml_engine.schemas import WaferPredictRequest, StagesMetrology, StageMetrology, DefectLog

def run_eval():
    df = pd.read_csv('backend/data/wafer_metrology_history.csv')
    predictor = WaferRiskPredictor(model_dir='backend/ml_engine')
    
    results = []
    
    for wafer_id, group in df.groupby('Wafer_ID'):
        stages = group.to_dict('records')
        if len(stages) < 3: continue
        
        # Keep nm values directly just in case it was trained on nm
        def get_stage(idx):
            return StageMetrology(
                x_error_px=float(stages[idx]['Incremental_dX_nm']),
                y_error_px=float(stages[idx]['Incremental_dY_nm']),
                overlay_error_px=float(stages[idx]['Overlay_Error_nm']),
                confidence=0.9,
                inlier_ratio=0.8
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
            label = stages[3]['Drift_Risk_Label'] if len(stages) > 3 else stages[-1]['Drift_Risk_Label']
            actual = 'DRIFT' if label in ['WATCH', 'CRITICAL_DRIFT'] else 'NORMAL'
            results.append({
                'wafer': wafer_id,
                'actual': actual,
                'pred': res.prediction.status,
                'prob': res.prediction.probability,
                'shap': res.shap_drivers
            })
        except Exception as e:
            pass
            
    # sort by probability
    results.sort(key=lambda x: x['prob'], reverse=True)
    
    print("Top 5 highest DRIFT probability predictions:")
    for r in results[:5]:
        print(f"\nWafer: {r['wafer']} | Actual: {r['actual']} | Pred: {r['pred']} | Prob: {r['prob']:.4f}")
        for s in r['shap']:
            print(f"  {s.feature}: {s.value} ({s.direction}, {s.contribution})")

if __name__ == '__main__':
    run_eval()
