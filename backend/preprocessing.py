"""
TransitFlow - Preprocessing Pipeline
====================================
Modular data transformation pipeline:
- Missing value median/mode imputation
- Cyclical sine/cosine time transforms
- One-hot encoding for transit routes and modes
- Standard scaling for continuous features
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERICAL_COLS = [
    "temperature_c",
    "precipitation_mm",
    "traffic_congestion_index",
]

CATEGORICAL_COLS = [
    "route_id",
    "vehicle_type",
    "weather_condition",
]

BINARY_COLS = [
    "major_event_nearby",
]

TIME_COLS = [
    "scheduled_hour",
]


class TransitDataPreprocessor(BaseEstimator, TransformerMixin):
    """
    Transforms public transport features for model training and live inference.
    """

    def __init__(self):
        self.encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
        self.scaler = StandardScaler()
        self.num_medians_ = {}
        self.cat_modes_ = {}
        self.feature_names_ = []
        self.is_fitted_ = False

    def fit(self, X: pd.DataFrame, y=None):
        df = X.copy()

        for col in NUMERICAL_COLS:
            val = pd.to_numeric(df.get(col, np.nan), errors="coerce")
            self.num_medians_[col] = float(val.median()) if not np.isnan(val.median()) else 0.0

        for col in CATEGORICAL_COLS:
            series = df.get(col, pd.Series()).astype(str).replace(["", "nan", "None", "<NA>"], np.nan)
            self.cat_modes_[col] = series.mode()[0] if not series.mode().empty else "Standard"

        df_imputed = self._impute(df)
        self.encoder.fit(df_imputed[CATEGORICAL_COLS].astype(str))
        self.scaler.fit(df_imputed[NUMERICAL_COLS].values)

        names = ["hour_sin", "hour_cos"]
        names.extend(NUMERICAL_COLS)
        names.extend(BINARY_COLS)
        names.extend(list(self.encoder.get_feature_names_out(CATEGORICAL_COLS)))
        self.feature_names_ = names

        self.is_fitted_ = True
        return self

    def _impute(self, df: pd.DataFrame) -> pd.DataFrame:
        clean_df = df.copy()

        for col, med in self.num_medians_.items():
            if col in clean_df.columns:
                clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce").fillna(med)
            else:
                clean_df[col] = med

        for col, mode_val in self.cat_modes_.items():
            if col in clean_df.columns:
                clean_df[col] = clean_df[col].astype(str).replace(["", "nan", "None", "<NA>"], np.nan).fillna(mode_val)
            else:
                clean_df[col] = mode_val

        for col in BINARY_COLS:
            if col in clean_df.columns:
                clean_df[col] = pd.to_numeric(clean_df[col], errors="coerce").fillna(0).astype(int)
            else:
                clean_df[col] = 0

        if "scheduled_hour" in clean_df.columns:
            clean_df["scheduled_hour"] = pd.to_numeric(clean_df["scheduled_hour"], errors="coerce").fillna(12)
        else:
            clean_df["scheduled_hour"] = 12

        return clean_df

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted_:
            raise RuntimeError("Preprocessor must be fitted before transforming.")

        df_clean = self._impute(X)

        # 24-hour trigonometric encoding
        hours = df_clean["scheduled_hour"].values
        hour_sin = np.sin(2 * np.pi * hours / 24.0).reshape(-1, 1)
        hour_cos = np.cos(2 * np.pi * hours / 24.0).reshape(-1, 1)
        time_matrix = np.hstack([hour_sin, hour_cos])

        num_matrix = self.scaler.transform(df_clean[NUMERICAL_COLS].values)
        bin_matrix = df_clean[BINARY_COLS].values.astype(float)
        cat_matrix = self.encoder.transform(df_clean[CATEGORICAL_COLS].astype(str))

        return np.hstack([time_matrix, num_matrix, bin_matrix, cat_matrix])

    def get_feature_names(self):
        return self.feature_names_

    def save(self, filepath: str = "models/preprocessor.joblib"):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str = "models/preprocessor.joblib"):
        return joblib.load(filepath)


def load_raw_dataset(csv_path: str = "data/public_transport_delays.csv") -> pd.DataFrame:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    return pd.read_csv(csv_path)
