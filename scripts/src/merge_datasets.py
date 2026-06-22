#!/usr/bin/env python3
"""
AeroSentinel Data Merge Pipeline
Merges CPCB, weather, satellite, and fire data into master_dataset.csv
"""

import pandas as pd
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def load_cpcb_data() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'cpcb_data.csv')
    log.info(f'Loading CPCB data from {path}')
    df = pd.read_csv(path, parse_dates=['date'])
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    return df

def load_weather_data() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'weather_data.csv')
    log.info(f'Loading weather data from {path}')
    df = pd.read_csv(path, parse_dates=['date'])
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    return df

def load_satellite_data() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'satellite_data.csv')
    log.info(f'Loading satellite data from {path}')
    df = pd.read_csv(path, parse_dates=['date'])
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    return df

def load_fire_data() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, 'fire_data.csv')
    log.info(f'Loading fire data from {path}')
    df = pd.read_csv(path, parse_dates=['date'])
    df.columns = df.columns.str.lower().str.replace(' ', '_')
    return df

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    log.info('Engineering features...')
    # Temporal features
    df['month'] = df['date'].dt.month
    df['day_of_year'] = df['date'].dt.dayofyear
    df['is_winter'] = df['month'].isin([11, 12, 1, 2]).astype(int)
    df['is_harvest_season'] = df['month'].isin([10, 11]).astype(int)

    # Interaction features
    df['pm25_no2_interaction'] = np.sqrt(df['pm25'] * df['no2'])
    df['fire_hcho_ratio'] = df['fire_count'] / (df['hcho'] + 0.001)
    df['pollution_load'] = df['pm25'] * 0.6 + df['pm10'] * 0.2 + df['no2'] * 0.1 + df['so2'] * 0.1
    df['wind_dilution'] = 1.0 / (df['wind_speed'] + 0.5)

    # Rolling averages (simulated)
    df['pm25_7d_avg'] = df.groupby('city')['pm25'].transform(lambda x: x.rolling(7, min_periods=1).mean())
    df['fire_7d_total'] = df.groupby('city')['fire_count'].transform(lambda x: x.rolling(7, min_periods=1).sum())

    return df

def merge_pipeline() -> pd.DataFrame:
    log.info('=== AeroSentinel Data Merge Pipeline ===')

    try:
        cpcb = load_cpcb_data()
        weather = load_weather_data()
        satellite = load_satellite_data()
        fire = load_fire_data()
    except FileNotFoundError as e:
        log.warning(f'Source CSV missing: {e}. Loading from master_dataset.csv')
        return pd.read_csv(os.path.join(DATA_DIR, 'master_dataset.csv'), parse_dates=['date'])

    # Merge on date + city
    merged = cpcb.merge(weather, on=['date', 'city'], how='left', suffixes=('', '_wx'))
    merged = merged.merge(satellite, on=['date', 'city'], how='left', suffixes=('', '_sat'))
    merged = merged.merge(fire, on=['date', 'city'], how='left', suffixes=('', '_fire'))

    # Fill missing values
    for col in ['hcho', 'aod', 'fire_count']:
        if col in merged.columns:
            merged[col] = merged[col].fillna(0)

    merged = feature_engineering(merged)

    # Save
    out_path = os.path.join(DATA_DIR, 'master_dataset.csv')
    merged.to_csv(out_path, index=False)
    log.info(f'Saved master_dataset.csv — {len(merged)} rows, {merged.shape[1]} features')
    log.info(f'Cities: {sorted(merged["city"].unique())}')
    return merged

if __name__ == '__main__':
    df = merge_pipeline()
    print(df.describe())
