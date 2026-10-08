#!/usr/bin/env python3
"""
AgriPulse AI - Trained CatBoost Model Training Pipeline
Trains the CatBoost regression model on Mumbai APMC Tur Dal historical data (2021-2024).
Predicts: FUTURE 14-DAY PRICE VOLATILITY.
Uses the exact 18 engineered features in the required order.
Saves model artifact: backend/ml_engine/catboost_volatility_model.cbm
"""

import os
import json
import math
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor

DATASET_CSV = os.path.join(os.path.dirname(__file__), "tur_dal_mumbai_dataset.csv")
MODEL_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "catboost_volatility_model.cbm")
METADATA_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "catboost_metadata.json")

FEATURE_NAMES = [
    "Current Modal Price",
    "Minimum Price",
    "Maximum Price",
    "Price Change %",
    "Price Lag 1",
    "Price Lag 2",
    "Price Lag 3",
    "Price Lag 7",
    "Price Lag 14",
    "Current 14-Day Rolling Volatility",
    "Previous Volatility",
    "Current Mandi Arrivals",
    "Previous-Day Mandi Arrivals",
    "Monthly Rainfall",
    "Rainfall-related feature",
    "Monsoon Month",
    "Deficit Year",
    "Day of Week"
]

def train_and_save_model():
    print(f"[AgriPulse ML] Loading dataset from: {DATASET_CSV}")
    df = pd.read_csv(DATASET_CSV)
    df['date_dt'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date_dt'].dt.dayofweek

    features = []
    targets = []
    n = len(df)

    # 18 engineered features matching exact definitions and order
    for i in range(14, n - 14):
        p_cur = float(df.loc[i, 'modal_price'])
        p_min = float(df.loc[i, 'min_price'])
        p_max = float(df.loc[i, 'max_price'])
        p_lag1 = float(df.loc[i-1, 'modal_price'])
        p_change_pct = float(((p_cur - p_lag1) / p_lag1) * 100.0)
        p_lag2 = float(df.loc[i-2, 'modal_price'])
        p_lag3 = float(df.loc[i-3, 'modal_price'])
        p_lag7 = float(df.loc[i-7, 'modal_price'])
        p_lag14 = float(df.loc[i-14, 'modal_price'])

        cur_vol_14d = float(df.loc[i, 'realized_volatility_14d'])
        prev_vol = float(df.loc[i-1, 'realized_volatility_14d'])

        cur_arr = float(df.loc[i, 'arrivals_quintals'])
        prev_arr = float(df.loc[i-1, 'arrivals_quintals'])

        monthly_rain = float(df.loc[max(0, i-29):i, 'rainfall_mm'].sum())
        rain_7d = float(df.loc[max(0, i-6):i, 'rainfall_mm'].sum())

        month = int(df.loc[i, 'month'])
        monsoon_month = 1 if 6 <= month <= 9 else 0
        deficit_pct = float(df.loc[i, 'rainfall_deficit_pct'])
        deficit_year = 1 if (int(df.loc[i, 'year']) == 2023 or deficit_pct < -15.0) else 0
        day_of_week = int(df.loc[i, 'day_of_week'])

        f_vec = [
            p_cur,
            p_min,
            p_max,
            p_change_pct,
            p_lag1,
            p_lag2,
            p_lag3,
            p_lag7,
            p_lag14,
            cur_vol_14d,
            prev_vol,
            cur_arr,
            prev_arr,
            monthly_rain,
            rain_7d,
            monsoon_month,
            deficit_year,
            day_of_week
        ]

        # Target: Forward 14-day price volatility
        target = float(df.loc[i + 14, 'realized_volatility_14d'])
        features.append(f_vec)
        targets.append(target)

    X = np.array(features)
    y = np.array(targets)
    print(f"[AgriPulse ML] Training dataset prepared: X shape={X.shape}, y shape={y.shape}")

    # CatBoost Regressor configuration
    model = CatBoostRegressor(
        iterations=700,
        learning_rate=0.04,
        depth=6,
        loss_function='RMSE',
        eval_metric='RMSE',
        random_seed=42,
        verbose=100
    )

    model.fit(X, y)

    # Save model binary file
    model.save_model(MODEL_OUTPUT_PATH)
    print(f"[AgriPulse ML] Trained CatBoost model saved to: {MODEL_OUTPUT_PATH}")

    # Also save standalone zero-dependency Python model for ultra-resilient fast execution
    py_eval_path = os.path.join(os.path.dirname(__file__), "catboost_model_eval.py")
    model.save_model(py_eval_path, format="python")
    print(f"[AgriPulse ML] Standalone Python model evaluator saved to: {py_eval_path}")

    # Feature importances
    feature_importances = model.get_feature_importance()
    feat_imp_dict = {FEATURE_NAMES[k]: float(feature_importances[k]) for k in range(len(FEATURE_NAMES))}

    # Save metadata
    preds = model.predict(X)
    rmse = float(np.sqrt(np.mean((preds - y)**2)))
    mae = float(np.mean(np.abs(preds - y)))

    metadata = {
        "model_type": "CatBoostRegressor",
        "model_file": "catboost_volatility_model.cbm",
        "training_date": "2024-12-31",
        "dataset_records_count": len(X),
        "feature_count": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "metrics": {
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "min_prediction": round(float(preds.min()), 2),
            "max_prediction": round(float(preds.max()), 2)
        },
        "feature_importances": feat_imp_dict,
        "risk_thresholds": {
            "low_max": 5.0,
            "moderate_max": 10.0,
            "high_max": 20.0
        }
    }

    with open(METADATA_OUTPUT_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[AgriPulse ML] Model metadata saved to: {METADATA_OUTPUT_PATH}")
    print(f"[AgriPulse ML] Training complete. RMSE: {rmse:.4f}, MAE: {mae:.4f}")

if __name__ == "__main__":
    train_and_save_model()
