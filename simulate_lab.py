import os
import time
import json
import random
import requests
import pandas as pd

API_BASE = "http://localhost:49999/api"

print("Starting Automated Lab Environment Simulator...")
print("This script simulates automated SEM metrology tools processing wafers in real-time.")

df = pd.read_csv("backend/data/wafer_metrology_history.csv")
grouped = df.groupby('Wafer_ID')
wafers = list(grouped.groups.keys())

try:
    while True:
        wafer_id = random.choice(wafers)
        stages = grouped.get_group(wafer_id).to_dict('records')
        
        print(f"\n--- [FAB SIMULATOR] Processing Wafer {wafer_id} ---")
        
        stage_map = {
            "01_Lithography": "Lithography",
            "02_Etch": "Etching",
            "03_CMP": "CMP",
            "04_Metal1": "Metal-1"
        }
        
        wafer_state = {
            "waferId": wafer_id,
            "batchId": f"B-{random.randint(1, 10):02d}",
            "status": "NORMAL",
            "riskScore": 0,
            "timestamp": "2026-08-16T12:00:00Z",
            "stages": []
        }
        
        for i, s in enumerate(stages):
            if i >= 3:
                break
                
            stage_name = stage_map.get(s['Stage_Name'], s['Stage_Name'])
            print(f"Tool: SEM Inspecting {wafer_id} at {stage_name}...")
            
            cv_req = {
                "wafer_id": wafer_id,
                "stage": stage_name,
                "search_image": s['Search_Image'],
                "reference_image": s['Reference_Image']
            }
            
            try:
                cv_res = requests.post(f"{API_BASE}/cv/locate", json=cv_req).json()
                if 'xError' not in cv_res:
                    print(f"CV Backend returned error: {cv_res}")
                    continue
            except Exception as e:
                print(f"CV Request Error: {e}")
                continue
                
            new_stage = {
                "stage": stage_name,
                "xError": cv_res['xError'] * 10.0,
                "yError": cv_res['yError'] * 10.0,
                "rotation": cv_res['rotation'],
                "scale": cv_res['scale'],
                "overlayError": cv_res['overlayError'] * 10.0,
                "confidence": cv_res['confidence'],
                "inlierRatio": cv_res['inlierRatio']
            }
            
            wafer_state["stages"].append(new_stage)
            
            if len(wafer_state["stages"]) >= 3:
                print(f"Tool: XGBoost evaluating drift risk for {wafer_id}...")
                req_stages = {
                    "stage_1": {
                        "x_error_px": wafer_state["stages"][0]["xError"] / 10.0,
                        "y_error_px": wafer_state["stages"][0]["yError"] / 10.0,
                        "overlay_error_px": wafer_state["stages"][0]["overlayError"] / 10.0,
                        "confidence": wafer_state["stages"][0]["confidence"],
                        "inlier_ratio": wafer_state["stages"][0]["inlierRatio"]
                    },
                    "stage_2": {
                        "x_error_px": wafer_state["stages"][1]["xError"] / 10.0,
                        "y_error_px": wafer_state["stages"][1]["yError"] / 10.0,
                        "overlay_error_px": wafer_state["stages"][1]["overlayError"] / 10.0,
                        "confidence": wafer_state["stages"][1]["confidence"],
                        "inlier_ratio": wafer_state["stages"][1]["inlierRatio"]
                    },
                    "stage_3": {
                        "x_error_px": wafer_state["stages"][2]["xError"] / 10.0,
                        "y_error_px": wafer_state["stages"][2]["yError"] / 10.0,
                        "overlay_error_px": wafer_state["stages"][2]["overlayError"] / 10.0,
                        "confidence": wafer_state["stages"][2]["confidence"],
                        "inlier_ratio": wafer_state["stages"][2]["inlierRatio"]
                    }
                }
                
                ml_req = {
                    "wafer_id": wafer_id,
                    "stages": req_stages,
                    "defects": {
                        "pre_s4_defect_count": 12,
                        "avg_defect_size": 24.5,
                        "bridge_defects": 1
                    }
                }
                
                try:
                    ml_res = requests.post(f"{API_BASE}/wafer/predict", json=ml_req).json()
                    wafer_state["status"] = ml_res["prediction"]["status"]
                    wafer_state["riskScore"] = ml_res["prediction"]["probability"] * 100
                except Exception as e:
                    print(f"ML Request Error: {e}")
            
            try:
                requests.post(f"{API_BASE}/wafer/save", json=wafer_state)
            except Exception as e:
                pass
                
            time.sleep(1.0)
            
        print(f"Finished {wafer_id}. Final Status: {wafer_state['status']}")
        time.sleep(2.0)

except KeyboardInterrupt:
    print("\nSimulation stopped.")
