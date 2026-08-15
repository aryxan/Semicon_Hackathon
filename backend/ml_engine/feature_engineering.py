"""
feature_engineering.py
Engineers physical features strictly from REAL CV measurements and REAL pre-Stage-4 defect logs.
NO synthetic parameters (no fake temperature, pressure, CD, etch rate, film thickness).
"""

import pandas as pd
import numpy as np

def add_semiconductor_features(df: pd.DataFrame) -> pd.DataFrame:
    df_feat = df.copy()
    
    # 1. Error Magnitudes per Stage from Real CV measurements (px space)
    df_feat["s1_error_mag"] = np.sqrt(df_feat["s1_x_error_px"]**2 + df_feat["s1_y_error_px"]**2)
    df_feat["s2_error_mag"] = np.sqrt(df_feat["s2_x_error_px"]**2 + df_feat["s2_y_error_px"]**2)
    df_feat["s3_error_mag"] = np.sqrt(df_feat["s3_x_error_px"]**2 + df_feat["s3_y_error_px"]**2)
    
    # 2. Stage-to-Stage Error Progression
    df_feat["error_change_s1_s2"] = df_feat["s2_error_mag"] - df_feat["s1_error_mag"]
    df_feat["error_change_s2_s3"] = df_feat["s3_error_mag"] - df_feat["s2_error_mag"]
    df_feat["error_drift_trend"] = df_feat["s3_error_mag"] - df_feat["s1_error_mag"]
    
    # 3. Acceleration of Drift (rate of error increase)
    df_feat["error_acceleration"] = df_feat["error_change_s2_s3"] - df_feat["error_change_s1_s2"]
    
    # 4. Cumulative Error across all 3 Stages
    df_feat["cumulative_error"] = (
        np.abs(df_feat["s1_x_error_px"]) + np.abs(df_feat["s1_y_error_px"]) +
        np.abs(df_feat["s2_x_error_px"]) + np.abs(df_feat["s2_y_error_px"]) +
        np.abs(df_feat["s3_x_error_px"]) + np.abs(df_feat["s3_y_error_px"])
    )
    
    # 5. Maximum Error observed in early stages
    df_feat["max_early_error"] = np.maximum(df_feat["s1_error_mag"], df_feat["s2_error_mag"])
    
    # 6. CV Registration Confidence Metrics
    df_feat["mean_confidence"] = (df_feat["s1_confidence"] + df_feat["s2_confidence"] + df_feat["s3_confidence"]) / 3.0
    df_feat["min_confidence"] = np.minimum(df_feat["s1_confidence"], np.minimum(df_feat["s2_confidence"], df_feat["s3_confidence"]))
    df_feat["confidence_drift"] = df_feat["s3_confidence"] - df_feat["s1_confidence"]
    
    # 7. Inlier Quality Metrics
    df_feat["mean_inlier_ratio"] = (df_feat["s1_inlier_ratio"] + df_feat["s2_inlier_ratio"] + df_feat["s3_inlier_ratio"]) / 3.0
    df_feat["min_inlier_ratio"] = np.minimum(df_feat["s1_inlier_ratio"], np.minimum(df_feat["s2_inlier_ratio"], df_feat["s3_inlier_ratio"]))
    df_feat["inlier_ratio_drift"] = df_feat["s3_inlier_ratio"] - df_feat["s1_inlier_ratio"]
    
    # 8. Composite Registration Quality Score
    df_feat["registration_reliability"] = df_feat["mean_confidence"] * (1.0 + df_feat["mean_inlier_ratio"])
    
    # 9. Defect Log Integration (real optical inspection)
    df_feat["has_bridge_defect"] = (df_feat["bridge_defects"] > 0).astype(float)
    df_feat["defect_impact_score"] = df_feat["pre_s4_defect_count"] * 1.5 + df_feat["avg_defect_size"] * 0.1
    
    return df_feat

# STRICT LIST OF FEATURES - PURE REAL CV + DEFECT MEASUREMENTS ONLY
FEATURE_COLUMNS = [
    # Real CV Raw Stage 1
    "s1_x_error_px", "s1_y_error_px", "s1_error_px", "s1_confidence", "s1_inlier_ratio",
    # Real CV Raw Stage 2
    "s2_x_error_px", "s2_y_error_px", "s2_error_px", "s2_confidence", "s2_inlier_ratio",
    # Real CV Raw Stage 3
    "s3_x_error_px", "s3_y_error_px", "s3_error_px", "s3_confidence", "s3_inlier_ratio",
    
    # Real Defect Log
    "pre_s4_defect_count", "avg_defect_size", "bridge_defects",
    
    # Derived Physical & CV Quality Metrics
    "s1_error_mag", "s2_error_mag", "s3_error_mag",
    "error_change_s1_s2", "error_change_s2_s3", "error_drift_trend",
    "error_acceleration", "cumulative_error", "max_early_error",
    "mean_confidence", "min_confidence", "confidence_drift",
    "mean_inlier_ratio", "min_inlier_ratio", "inlier_ratio_drift",
    "registration_reliability", "has_bridge_defect", "defect_impact_score"
]

if __name__ == "__main__":
    import os
    if os.path.exists("ml_dataset.csv"):
        df_test = pd.read_csv("ml_dataset.csv")
        df_eng = add_semiconductor_features(df_test)
        print(f"[OK] Pure Real Feature Engineering verified: {len(FEATURE_COLUMNS)} total features.")
