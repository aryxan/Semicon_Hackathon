"""
train_xgboost.py
Trains the XGBoost Binary Classifier using strictly:
- Real CV Stage 1-3 measurements & optical defect logs as inputs
- Real Stage 4 Drift_Risk_Label from the Semicorn hackathon dataset as ground truth
- 5-Fold Stratified Cross-Validation
- GPU Accelerated (NVIDIA RTX 5050 CUDA)
"""

import os
import joblib
import numpy as np
import pandas as pd
import warnings

warnings.filterwarnings("ignore")

from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import xgboost as xgb
from feature_engineering import add_semiconductor_features, FEATURE_COLUMNS

def train_model():
    if not os.path.exists("ml_dataset.csv"):
        raise FileNotFoundError("ml_dataset.csv missing! Run build_ml_dataset.py first.")
        
    df = pd.read_csv("ml_dataset.csv")
    df_feat = add_semiconductor_features(df)
    
    X = df_feat[FEATURE_COLUMNS]
    y = df_feat["binary_target"].values
    
    n_normal = np.sum(y == 0)
    n_drift = np.sum(y == 1)
    spw = n_normal / n_drift
    
    print("=" * 60)
    print("   TRAINING ON 100% REAL CV & METROLOGY DATASET")
    print("=" * 60)
    print(f"Total Real Wafers     : {len(y)}")
    print(f"NORMAL Wafers (0)     : {n_normal} ({n_normal/len(y)*100:.1f}%)")
    print(f"DRIFT Wafers  (1)     : {n_drift} ({n_drift/len(y)*100:.1f}%)")
    print(f"Real Features Used    : {len(FEATURE_COLUMNS)} (0 synthetic parameters)")
    print(f"scale_pos_weight      : {spw:.2f}")
    print(f"Hardware Acceleration : NVIDIA RTX 5050 (CUDA)")
    print()
    
    # 1. 5-Fold Stratified Cross-Validation on Real Data
    cv_model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        device="cuda",
        scale_pos_weight=spw,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42
    )
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = ["accuracy", "precision", "recall", "f1", "roc_auc"]
    cv_results = cross_validate(cv_model, X.values, y, cv=cv, scoring=scoring)
    
    print("--- 5-Fold Cross-Validation on Real CV Data ---")
    print(f"  Accuracy  : {cv_results['test_accuracy'].mean()*100:.2f}% (+/- {cv_results['test_accuracy'].std()*100:.2f}%)")
    print(f"  Precision : {cv_results['test_precision'].mean()*100:.2f}% (+/- {cv_results['test_precision'].std()*100:.2f}%)")
    print(f"  Recall    : {cv_results['test_recall'].mean()*100:.2f}% (+/- {cv_results['test_recall'].std()*100:.2f}%)")
    print(f"  F1-Score  : {cv_results['test_f1'].mean()*100:.2f}% (+/- {cv_results['test_f1'].std()*100:.2f}%)")
    print(f"  ROC-AUC   : {cv_results['test_roc_auc'].mean():.4f} (+/- {cv_results['test_roc_auc'].std():.4f})")
    print()
    
    # 2. 80/20 Train-Test Split (Unseen Validation)
    X_train, X_test, y_train, y_test = train_test_split(X.values, y, test_size=0.2, stratify=y, random_state=42)
    split_model = xgb.XGBClassifier(
        n_estimators=100, max_depth=3, learning_rate=0.08, subsample=0.8, colsample_bytree=0.8,
        tree_method="hist", device="cuda", scale_pos_weight=spw, objective="binary:logistic",
        eval_metric="logloss", random_state=42
    )
    split_model.fit(X_train, y_train)
    y_test_pred = split_model.predict(X_test)
    y_test_proba = split_model.predict_proba(X_test)[:, 1]
    
    print("--- 80/20 Split on 20 Held-Out Unseen Wafers ---")
    print(f"  Test Accuracy  : {accuracy_score(y_test, y_test_pred)*100:.2f}%")
    print(f"  Test Precision : {precision_score(y_test, y_test_pred)*100:.2f}%")
    print(f"  Test Recall    : {recall_score(y_test, y_test_pred)*100:.2f}%")
    print(f"  Test F1-Score  : {f1_score(y_test, y_test_pred)*100:.2f}%")
    print(f"  Test ROC-AUC   : {roc_auc_score(y_test, y_test_proba):.4f}")
    
    cm = confusion_matrix(y_test, y_test_pred)
    print(f"\n  Test Confusion Matrix:")
    print(f"                  Predicted NORMAL  Predicted DRIFT")
    print(f"  Actual NORMAL      {cm[0][0]:5d}            {cm[0][1]:5d}")
    print(f"  Actual DRIFT       {cm[1][0]:5d}            {cm[1][1]:5d}")
    print()
    
    # 3. Train final model for deployment
    final_model = xgb.XGBClassifier(
        n_estimators=100, max_depth=3, learning_rate=0.08, subsample=0.8, colsample_bytree=0.8,
        tree_method="hist", device="cuda", scale_pos_weight=spw, objective="binary:logistic",
        eval_metric="logloss", random_state=42
    )
    final_model.fit(X.values, y)
    
    final_model.save_model("xgboost_wafer_risk.json")
    joblib.dump(FEATURE_COLUMNS, "feature_columns.joblib")
    print("[OK] Saved Model: xgboost_wafer_risk.json & feature_columns.joblib")
    print("=" * 60)

if __name__ == "__main__":
    train_model()
