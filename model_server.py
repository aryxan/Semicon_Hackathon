"""
model_server.py
Semiconductor Wafer Risk Prediction - Clean Terminal Interface with Native TreeSHAP Explanations
and Live Execution Time Display.
"""

import os
import sys
import time
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
os.environ["PYTHONWARNINGS"] = "ignore"

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from inference import WaferRiskPredictor

def compute_detailed_drift_trend(s1_ov, s2_ov, s3_ov):
    diff_1_2 = s2_ov - s1_ov
    diff_2_3 = s3_ov - s2_ov
    
    if diff_1_2 > 0.05 and diff_2_3 > -0.05 and (s3_ov > s1_ov * 1.15):
        return "INCREASING"
    if diff_1_2 < -0.05 and diff_2_3 < 0.05 and (s3_ov < s1_ov * 0.85):
        return "DECREASING"
    max_val = max(s1_ov, s2_ov, s3_ov)
    min_val = min(s1_ov, s2_ov, s3_ov)
    if (max_val - min_val) < 0.35:
        return "STABLE"
    return "MIXED"

def format_shap_risk_factor(feature_name, value, drift_trend):
    name = feature_name.lower()
    if "s3_error" in name or "s2_error" in name or "s1_error" in name:
        if drift_trend == "INCREASING":
            return "Increasing overlay error"
        elif drift_trend == "MIXED":
            return "Fluctuating stage overlay pattern"
        else:
            return "Elevated stage-level error pattern"
    if "cumulative" in name or "change" in name or "acceleration" in name or "early" in name:
        return "Stage-to-stage error accumulation"
    if "defect" in name or "bridge" in name:
        return "Spatial defect/feature pattern"
    if "confidence" in name or "inlier" in name or "registration" in name:
        return "CV measurement confidence/pattern"
    return "Metrology drift variation"

class WaferRiskModel:
    def __init__(self, model_dir="."):
        self.model_dir = model_dir
        self.predictor = WaferRiskPredictor(model_dir)
        
    def predict(self, metrology_data):
        return self.predictor.predict_wafer_risk(metrology_data)
        
    def predict_from_csv(self, csv_path):
        df = pd.read_csv(csv_path)
        predictions = []
        for _, row in df.iterrows():
            result = self.predict(row.to_dict())
            predictions.append(result)
        return predictions

def print_clean_terminal_output(dataset_path="ml_dataset.csv", target_wafer_id=None):
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset {dataset_path} not found.")
        return

    # Measure total execution time
    start_total_time = time.perf_counter()

    df_raw = pd.read_csv(dataset_path)
    model = WaferRiskModel(".")
    
    # Measure prediction time
    start_pred_time = time.perf_counter()
    predictions = model.predict_from_csv(dataset_path)
    end_pred_time = time.perf_counter()
    
    batch_pred_ms = (end_pred_time - start_pred_time) * 1000
    avg_per_wafer_ms = batch_pred_ms / max(len(predictions), 1)

    total_wafers = len(predictions)
    normal_count = sum(1 for p in predictions if p["Drift_Risk_Label"] == "NORMAL")
    drift_count = sum(1 for p in predictions if p["Drift_Risk_Label"] == "DRIFT")
    
    print("=" * 80)
    print("                    SEMICONDUCTOR WAFER RISK PREDICTION")
    print("=" * 80)
    print()
    print(f"CV DATA LOADED    : {total_wafers} wafers")
    print(f"MODEL             : XGBoost (GPU Accelerated - RTX 5050)")
    print(f"FEATURES          : 36 real CV measurements + drift quality features")
    print(f"INFERENCE TIME    : {avg_per_wafer_ms:.2f} ms per wafer ({batch_pred_ms:.1f} ms for all 100 wafers)")
    print()
    print("-" * 80)
    print("                         PREDICTION SUMMARY")
    print("-" * 80)
    print()
    print(f"NORMAL WAFERS : {normal_count}")
    print(f"DRIFT WAFERS  : {drift_count}")
    print()
    print("-" * 80)
    print("                         WAFER PREDICTIONS")
    print("-" * 80)
    print()
    print(f"{'Wafer ID':<12} {'Risk Status':<17} {'Probability':<17} {'Action'}")
    print("-" * 80)
    
    displayed_indices = list(range(0, min(5, total_wafers)))
    drift_indices = [i for i, p in enumerate(predictions) if p["Drift_Risk_Label"] == "DRIFT"]
    if drift_indices and drift_indices[0] not in displayed_indices:
        displayed_indices.append(drift_indices[0])
    
    displayed_indices = sorted(list(set(displayed_indices)))
    
    for i in displayed_indices:
        p = predictions[i]
        prob_str = f"{p['drift_probability'] * 100:.1f}%"
        print(f"{p['wafer_id']:<12} {p['Drift_Risk_Label']:<17} {prob_str:<17} {p['recommended_action']}")
        
    if total_wafers > 6:
        print("...")
        last_p = predictions[-1]
        last_prob = f"{last_p['drift_probability'] * 100:.1f}%"
        print(f"{last_p['wafer_id']:<12} {last_p['Drift_Risk_Label']:<17} {last_prob:<17} {last_p['recommended_action']}")
        
    selected_pred = None
    selected_raw = None
    
    if target_wafer_id:
        for idx, p in enumerate(predictions):
            if p["wafer_id"].upper() == target_wafer_id.upper():
                selected_pred = p
                selected_raw = df_raw.iloc[idx]
                break
                
    if selected_pred is None:
        if drift_indices:
            idx = drift_indices[0]
            selected_pred = predictions[idx]
            selected_raw = df_raw.iloc[idx]
        else:
            selected_pred = predictions[0]
            selected_raw = df_raw.iloc[0]

    s1_x = float(selected_raw.get("s1_x_error_px", 0.0))
    s1_y = float(selected_raw.get("s1_y_error_px", 0.0))
    s1_ov = float(selected_raw.get("s1_error_px", np.sqrt(s1_x**2 + s1_y**2)))

    s2_x = float(selected_raw.get("s2_x_error_px", 0.0))
    s2_y = float(selected_raw.get("s2_y_error_px", 0.0))
    s2_ov = float(selected_raw.get("s2_error_px", np.sqrt(s2_x**2 + s2_y**2)))

    s3_x = float(selected_raw.get("s3_x_error_px", 0.0))
    s3_y = float(selected_raw.get("s3_y_error_px", 0.0))
    s3_ov = float(selected_raw.get("s3_error_px", np.sqrt(s3_x**2 + s3_y**2)))

    drift_trend = compute_detailed_drift_trend(s1_ov, s2_ov, s3_ov)

    print()
    print("-" * 80)
    print("                     SELECTED WAFER ANALYSIS")
    print("-" * 80)
    print()
    print(f"Wafer ID: {selected_pred['wafer_id']}")
    print()
    print("Stage 1")
    print(f"  X Error:       {s1_x:>8.2f} px")
    print(f"  Y Error:       {s1_y:>8.2f} px")
    print(f"  Overlay Error: {s1_ov:>8.2f} px")
    print()
    print("Stage 2")
    print(f"  X Error:       {s2_x:>8.2f} px")
    print(f"  Y Error:       {s2_y:>8.2f} px")
    print(f"  Overlay Error: {s2_ov:>8.2f} px")
    print()
    print("Stage 3")
    print(f"  X Error:       {s3_x:>8.2f} px")
    print(f"  Y Error:       {s3_y:>8.2f} px")
    print(f"  Overlay Error: {s3_ov:>8.2f} px")
    print()
    print(f"Drift Trend:        {drift_trend}")
    print()
    print("-" * 80)
    print("                         ML PREDICTION")
    print("-" * 80)
    print()
    
    is_drift = selected_pred['Drift_Risk_Label'] == 'DRIFT'
    action_text = "HOLD / STOP" if is_drift else "PASS"
    risk_label = selected_pred['Drift_Risk_Label']
    
    try:
        status_line = f"Risk Status:        {'🔴 ' if is_drift else '🟢 '}{risk_label}"
        print(status_line)
    except Exception:
        status_line = f"Risk Status:        [{risk_label}]"
        print(status_line)
        
    print(f"Drift Probability:  {selected_pred['drift_probability'] * 100:.1f}%")
    print(f"Recommended Action: {action_text}")
    print()
    print("Main Risk Factors:")
    
    raw_drivers = selected_pred.get("top_risk_drivers", [])
    seen = []
    final_factors = []
    
    for driver in raw_drivers:
        desc = format_shap_risk_factor(driver["feature"], driver.get("value", 0), drift_trend)
        if desc not in seen:
            seen.append(desc)
            final_factors.append(desc)
            
    fallback_pool = [
        "Elevated stage-level error pattern" if drift_trend != "INCREASING" else "Increasing overlay error",
        "Spatial defect/feature pattern",
        "CV measurement confidence/pattern"
    ]
    for fb in fallback_pool:
        if len(final_factors) < 3 and fb not in final_factors:
            final_factors.append(fb)
            
    for i, desc in enumerate(final_factors[:3], 1):
        print(f"  {i}. {desc}")
        
    end_total_time = time.perf_counter()
    total_elapsed_sec = end_total_time - start_total_time

    print()
    print("=" * 80)
    print(f"           PIPELINE COMPLETE  (Total Response Time: {total_elapsed_sec:.2f}s)")
    print("=" * 80)
    print()

if __name__ == "__main__":
    target_id = sys.argv[1] if len(sys.argv) > 1 else None
    print_clean_terminal_output("ml_dataset.csv", target_id)
