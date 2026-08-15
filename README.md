# 🛡️ Semiconductor Wafer Early Drift Risk Prediction

An end-to-end, GPU-accelerated Machine Learning pipeline designed for early-stage semiconductor wafer alignment drift and defect risk detection.

---

## 📌 Problem Overview

In advanced semiconductor fabrication (photolithography, etch, CMP, metallization), minor sub-pixel misalignment and optical defect clustering in early processing stages compound rapidly, leading to severe yield loss by final inspection.

This model ingests **pre-Stage-4 Computer Vision (CV) metrology alignment measurements** and **optical defect logs** to predict whether a wafer will suffer from **critical alignment drift (`DRIFT`)** or successfully **pass quality inspection (`NORMAL`)**, enabling real-time fab-line intervention (`PASS` vs `HOLD/STOP`).

---

## 🏗️ Architecture & Data Pipeline

```
       Stage 1 (Lithography)        Stage 2 (Plasma Etch)        Stage 3 (CMP / Deposition)
       ┌───────────────────┐        ┌───────────────────┐        ┌───────────────────────┐
       │ • X/Y error (px)  │        │ • X/Y error (px)  │        │ • X/Y error (px)      │
       │ • Confidence      │───────>│ • Confidence      │───────>│ • Confidence          │
       │ • Inlier ratio    │        │ • Inlier ratio    │        │ • Inlier ratio        │
       └───────────────────┘        └───────────────────┘        └───────────────────────┘
                 │                            │                              │
                 └────────────────────────────┼──────────────────────────────┘
                                              ▼
                             ┌───────────────────────────────────┐
                             │ Pre-Stage-4 Optical Defect Logs   │
                             │ • Defect count, bridge type, size │
                             └───────────────────────────────────┘
                                              │
                                              ▼
                             ┌───────────────────────────────────┐
                             │    Feature Engineering (36 Feat)  │
                             │ • Euclidean drift magnitudes      │
                             │ • Stage-to-stage acceleration     │
                             │ • Registration reliability index  │
                             └───────────────────────────────────┘
                                              │
                                              ▼
                             ┌───────────────────────────────────┐
                             │  GPU XGBoost Binary Classifier    │
                             │       (tree_method="hist")        │
                             └───────────────────────────────────┘
                                              │
                                              ▼
                             ┌───────────────────────────────────┐
                             │      Explainable ML Decision      │
                             │ • Risk Status: NORMAL / DRIFT     │
                             │ • Probability Score (%)           │
                             │ • Action: PASS / HOLD_STOP        │
                             │ • TreeSHAP Risk Drivers           │
                             └───────────────────────────────────┘
```

---

## 🔬 Feature Set (36 Pure Real Features)

All 36 features are derived strictly from **pre-Stage-4 real Computer Vision measurements and optical defect inspection**:

1. **Stage 1 Lithography Raw CV (5)**: `s1_x_error_px`, `s1_y_error_px`, `s1_error_px`, `s1_confidence`, `s1_inlier_ratio`
2. **Stage 2 Plasma Etch Raw CV (5)**: `s2_x_error_px`, `s2_y_error_px`, `s2_error_px`, `s2_confidence`, `s2_inlier_ratio`
3. **Stage 3 CMP Raw CV (5)**: `s3_x_error_px`, `s3_y_error_px`, `s3_error_px`, `s3_confidence`, `s3_inlier_ratio`
4. **Pre-Stage-4 Optical Defect Logs (3)**: `pre_s4_defect_count`, `avg_defect_size`, `bridge_defects`
5. **Physical & Registration Quality Metrics (18)**:
   - Euclidean error magnitudes (`s1_error_mag`, `s2_error_mag`, `s3_error_mag`)
   - Stage-to-stage progression & acceleration (`error_change_s1_s2`, `error_change_s2_s3`, `error_drift_trend`, `error_acceleration`)
   - Cumulative stage errors (`cumulative_error`, `max_early_error`)
   - CV confidence & inlier reliability trends (`mean_confidence`, `confidence_drift`, `mean_inlier_ratio`, `inlier_ratio_drift`, `registration_reliability`)
   - Optical defect severity metrics (`has_bridge_defect`, `defect_impact_score`)

---

## 📊 Model Performance & Validation

Evaluated using **Stratified 5-Fold Cross-Validation** and a **20-wafer held-out unseen test set**:

- **Evaluation Metrics**:
  - **Test Accuracy**: `85.00%`
  - **Test Recall (DRIFT)**: `80.00%` *(Catches 4 out of 5 dangerous drifting wafers before final stage)*
  - **Test Precision**: `66.67%`
  - **Test ROC-AUC**: `0.8400`
- **Zero Target Leakage**: Verified zero inclusion of Stage 4 measurements or post-inspection targets.
- **Wafer-Level Isolation**: Split strictly by unique Wafer ID with zero cross-contamination.

---

## ⚡ Execution Speed Benchmarks

Benchmarked on **NVIDIA RTX 5050 GPU (CUDA)**:

| Operation | Latency |
| :--- | :--- |
| **Core GPU Prediction (Single Wafer)** | **$13.64\ \mu\text{s}$ (microseconds)** |
| **End-to-End Inference + TreeSHAP** | **$5.96\text{ ms}$ per wafer** |
| **Full 100-Wafer Pipeline & Report** | **$0.59\text{ seconds}$** |
| **GPU Model Training (5-Fold CV + Final Fit)** | **$2.15\text{ seconds}$** |

---

## 🚀 Quickstart & Usage

### 1. Run the Complete Pipeline
```bash
python run_pipeline.py
```

### 2. Inspect a Specific Wafer
```bash
python model_server.py W_011
```

### 3. Python API Integration
```python
from model_server import WaferRiskModel

model = WaferRiskModel(".")
result = model.predict({
    "s1_x_error_px": 0.49,
    "s1_y_error_px": -1.29,
    "s1_error_px": 1.38,
    "s1_confidence": 0.30,
    "s1_inlier_ratio": 0.0,
    # ... stage 2 & 3 measurements
})

print(result["Drift_Risk_Label"])   # "DRIFT" or "NORMAL"
print(result["drift_probability"])  # 0.923 (92.3%)
print(result["recommended_action"]) # "HOLD/STOP"
```

---

## 📁 Repository Structure

```text
model/
├── feature_engineering.py     # 36-feature extraction & physical calculations
├── train_xgboost.py           # GPU-accelerated XGBoost training & 5-fold CV
├── inference.py               # Real-time inference engine with TreeSHAP
├── model_server.py            # Terminal presentation layer & API wrapper
├── run_pipeline.py            # End-to-end execution runner
├── xgboost_wafer_risk.json    # Trained XGBoost GPU model artifact
├── feature_columns.joblib     # Serialized 36-feature schema
├── PARAMETERS_GUIDE.md        # Detailed feature & parameter documentation
└── README.md                  # Project overview & guide
```
