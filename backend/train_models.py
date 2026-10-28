"""
TransitFlow - Model Training Pipeline
======================================
Trains an XGBoost Classifier for delay risk classification and an
XGBoost Regressor for delay minutes estimation using an 80/20 train-test split.
Saves all artifacts into `models/` via joblib.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, mean_absolute_error, r2_score

try:
    from xgboost import XGBClassifier, XGBRegressor
    XGB_AVAILABLE = True
except ImportError:
    from sklearn.ensemble import RandomForestClassifier as XGBClassifier
    from sklearn.ensemble import RandomForestRegressor as XGBRegressor
    XGB_AVAILABLE = False

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.preprocessing import (
    TransitDataPreprocessor,
    NUMERICAL_COLS,
    CATEGORICAL_COLS,
    BINARY_COLS,
    TIME_COLS,
    load_raw_dataset,
)


def train_models(
    csv_path: str = "data/public_transport_delays.csv",
    models_dir: str = "models",
    random_state: int = 42,
):
    os.makedirs(models_dir, exist_ok=True)
    print("=" * 60)
    print(" TransitFlow - Model Training (80/20 Train-Test Split)")
    print("=" * 60)

    df = load_raw_dataset(csv_path)
    y_reg = pd.to_numeric(df["delay_minutes"], errors="coerce").fillna(0.0).values
    y_clf = pd.to_numeric(df["is_delayed"], errors="coerce").fillna(0).astype(int).values

    feature_cols = NUMERICAL_COLS + CATEGORICAL_COLS + BINARY_COLS + TIME_COLS
    X_raw = df[feature_cols]

    preprocessor = TransitDataPreprocessor()
    X_processed = preprocessor.fit_transform(X_raw)

    (
        X_train,
        X_test,
        y_train_clf,
        y_test_clf,
        y_train_reg,
        y_test_reg,
    ) = train_test_split(
        X_processed,
        y_clf,
        y_reg,
        test_size=0.20,
        random_state=random_state,
        stratify=y_clf,
    )

    # 1. XGBoost Classifier
    print("Fitting Classifier...")
    if XGB_AVAILABLE:
        clf = XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            eval_metric="logloss",
            random_state=random_state,
        )
    else:
        clf = XGBClassifier(n_estimators=100, max_depth=8, random_state=random_state)

    clf.fit(X_train, y_train_clf)
    y_pred_clf = clf.predict(X_test)
    acc = float(accuracy_score(y_test_clf, y_pred_clf))
    f1 = float(f1_score(y_test_clf, y_pred_clf, zero_division=0))

    # 2. XGBoost Regressor
    print("Fitting Regressor...")
    if XGB_AVAILABLE:
        reg = XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=random_state,
        )
    else:
        reg = XGBRegressor(n_estimators=100, max_depth=8, random_state=random_state)

    reg.fit(X_train, y_train_reg)
    y_pred_reg = np.clip(reg.predict(X_test), 0, None)
    mae = float(mean_absolute_error(y_test_reg, y_pred_reg))
    r2 = float(r2_score(y_test_reg, y_pred_reg))

    print(f"Accuracy: {acc * 100:.1f}% | F1: {f1:.3f} | MAE: {mae:.2f} mins | R²: {r2:.3f}")

    # Save artifacts
    joblib.dump(preprocessor, os.path.join(models_dir, "preprocessor.joblib"))
    joblib.dump(clf, os.path.join(models_dir, "classifier.joblib"))
    joblib.dump(reg, os.path.join(models_dir, "regressor.joblib"))

    summary = {
        "accuracy": round(acc, 4),
        "f1": round(f1, 4),
        "mae": round(mae, 2),
        "r2": round(r2, 4),
        "total_samples": len(df),
    }
    with open(os.path.join(models_dir, "metrics_summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("Training artifacts exported successfully to models/")
    return summary


if __name__ == "__main__":
    train_models()
