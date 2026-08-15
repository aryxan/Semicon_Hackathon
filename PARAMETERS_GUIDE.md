# 📋 SEMICONDUCTOR ML MODEL - SPECIFICATION & PARAMETERS GUIDE

## 🚀 OVERVIEW

This document defines the exact specifications of the final **Semiconductor Wafer Early Drift Detection Model**.

- **Dataset**: 100% Real Semicorn Dataset (`results.csv`, `defect_log.csv`, `wafer_metrology_history.csv`)
- **Total Real Wafers**: 100
- **Total Feature Set**: **36 Pure Real Features** (0 synthetic parameters)
- **Model Architecture**: GPU-Accelerated XGBoost Binary Classifier (`tree_method="hist"`, `device="cuda"`)
- **Hardware**: NVIDIA RTX 5050 (CUDA)
- **Ground Truth**: Real Stage 4 `Drift_Risk_Label` (73 NORMAL, 27 DRIFT)

---

## 📥 THE 36 FINAL FEATURES BREAKDOWN

All 36 features are derived strictly from Stage 1–3 Computer Vision measurements and optical defect inspection logs:

### 1. Stage 1 — Photolithography Real CV Measurements (5 features)
1. `s1_x_error_px` — X-axis misalignment error (pixels)
2. `s1_y_error_px` — Y-axis misalignment error (pixels)
3. `s1_error_px` — Raw alignment error magnitude (pixels)
4. `s1_confidence` — Feature matching confidence score ($0.0 - 1.0$)
5. `s1_inlier_ratio` — Keypoint registration inlier ratio ($0.0 - 1.0$)

### 2. Stage 2 — Plasma Etch Real CV Measurements (5 features)
6. `s2_x_error_px` — X-axis misalignment error (pixels)
7. `s2_y_error_px` — Y-axis misalignment error (pixels)
8. `s2_error_px` — Raw alignment error magnitude (pixels)
9. `s2_confidence` — Feature matching confidence score ($0.0 - 1.0$)
10. `s2_inlier_ratio` — Keypoint registration inlier ratio ($0.0 - 1.0$)

### 3. Stage 3 — CMP / Deposition Real CV Measurements (5 features)
11. `s3_x_error_px` — X-axis misalignment error (pixels)
12. `s3_y_error_px` — Y-axis misalignment error (pixels)
13. `s3_error_px` — Raw alignment error magnitude (pixels)
14. `s3_confidence` — Feature matching confidence score ($0.0 - 1.0$)
15. `s3_inlier_ratio` — Keypoint registration inlier ratio ($0.0 - 1.0$)

### 4. Optical Defect Inspection Logs — Pre-Stage 4 (3 features)
16. `pre_s4_defect_count` — Total defects detected prior to Stage 4
17. `avg_defect_size` — Average defect size in pixels
18. `bridge_defects` — Count of critical electrical bridge defects

### 5. Engineered Physical & CV Quality Metrics (18 features)
19. `s1_error_mag` — Computed Euclidean error: $\sqrt{X_1^2 + Y_1^2}$
20. `s2_error_mag` — Computed Euclidean error: $\sqrt{X_2^2 + Y_2^2}$
21. `s3_error_mag` — Computed Euclidean error: $\sqrt{X_3^2 + Y_3^2}$
22. `error_change_s1_s2` — Delta error from Stage 1 to Stage 2
23. `error_change_s2_s3` — Delta error from Stage 2 to Stage 3
24. `error_drift_trend` — Total error drift from Stage 1 to Stage 3
25. `error_acceleration` — Second derivative / acceleration of drift
26. `cumulative_error` — Sum of absolute pixel misalignments across all stages
27. `max_early_error` — Maximum error observed across Stages 1 & 2
28. `mean_confidence` — Average CV measurement confidence
29. `min_confidence` — Minimum CV confidence across the stages
30. `confidence_drift` — Change in measurement confidence from Stage 1 to 3
31. `mean_inlier_ratio` — Average keypoint registration inlier ratio
32. `min_inlier_ratio` — Minimum inlier ratio across stages
33. `inlier_ratio_drift` — Change in inlier quality from Stage 1 to 3
34. `registration_reliability` — Reliability index ($\text{confidence} \times (1 + \text{inlier})$)
35. `has_bridge_defect` — Binary flag for presence of bridging defect
36. `defect_impact_score` — Weighted optical defect impact score

---

## 🔢 PERFORMANCE METRICS (100% Real Semicorn Dataset)

```text
5-Fold Stratified Cross-Validation:
  Accuracy  : 74.00% (+/- 5.83%)
  Precision : 52.24% (+/- 14.34%)
  Recall    : 44.00% (+/- 13.56%)
  ROC-AUC   : 0.7139 (+/- 0.1065)

80/20 Train/Test Split (20 Held-Out Unseen Wafers):
  Test Accuracy  : 85.00%
  Test Recall    : 80.00% (4 out of 5 drifts caught)
  Test Precision : 66.67%
  Test ROC-AUC   : 0.8400
```

---

## ⏱️ EXECUTION SPEED BENCHMARK

- **Core GPU Prediction Time**: $13.64\ \mu\text{s}$ per wafer
- **End-to-End Inference (with TreeSHAP)**: $6.00\text{ ms}$ per wafer
- **Full 100-Wafer Pipeline & Report**: $0.59\text{ seconds}$
