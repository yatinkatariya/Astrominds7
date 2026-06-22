#!/usr/bin/env python3
"""
AeroSentinel AI Model Training
XGBoost Regressor for AQI prediction from satellite + met. features
"""

import os
import json
import logging

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.preprocessing import StandardScaler

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURES = [
    'no2', 'so2', 'co', 'o3', 'temp', 'humidity', 'wind_speed',
    'aod', 'fire_count', 'hcho',
]
TARGET = 'aqi'

def load_data() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'master_dataset.csv')
    df = pd.read_csv(path)
    log.info(f'Loaded dataset: {df.shape}')
    return df

def train(df: pd.DataFrame):
    # Drop missing
    df = df.dropna(subset=FEATURES + [TARGET])
    X = df[FEATURES].values
    y = df[TARGET].values

    log.info(f'Training on {len(X)} samples, {len(FEATURES)} features')

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    try:
        from xgboost import XGBRegressor
        import joblib

        model = XGBRegressor(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.08,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42,
            n_jobs=-1,
        )

        log.info('Fitting XGBoost model...')
        model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

        y_pred = model.predict(X_test)
        r2   = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        mae  = mean_absolute_error(y_test, y_pred)

        log.info(f'R² Score : {r2:.4f}')
        log.info(f'RMSE     : {rmse:.2f}')
        log.info(f'MAE      : {mae:.2f}')

        # Save model
        model_path = os.path.join(MODEL_DIR, 'aqi_model.pkl')
        joblib.dump({'model': model, 'features': FEATURES, 'scaler': None}, model_path)
        log.info(f'Model saved to {model_path}')

        # Feature importance
        importances = model.feature_importances_
        feat_imp = sorted(zip(FEATURES, importances.tolist()), key=lambda x: -x[1])
        log.info('Feature importances:')
        for feat, imp in feat_imp:
            log.info(f'  {feat:15s} {imp:.4f}')

        # Save metrics
        metrics = {
            'r2': round(float(r2), 4),
            'rmse': round(float(rmse), 2),
            'mae': round(float(mae), 2),
            'train_samples': int(len(X_train)),
            'test_samples': int(len(X_test)),
            'feature_importance': [{'name': f, 'importance': round(i, 4)} for f, i in feat_imp],
        }
        metrics_path = os.path.join(MODEL_DIR, 'metrics.json')
        with open(metrics_path, 'w') as fp:
            json.dump(metrics, fp, indent=2)
        log.info(f'Metrics saved to {metrics_path}')
        return metrics

    except ImportError:
        log.warning('xgboost not installed. Install with: pip install xgboost scikit-learn joblib')
        raise

if __name__ == '__main__':
    df = load_data()
    train(df)
