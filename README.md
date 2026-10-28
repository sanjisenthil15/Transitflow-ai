# TransitFlow: ML Public Transport Delay Prediction & Reliability Engine

TransitFlow is a modular, production-grade Machine Learning system designed to predict public transport arrival delays, classify trip reliability risk, and provide SHAP-based feature attributions.

---

## 📁 Project Directory Structure

```text
TransitFlow/
│
├── requirements.txt            # Python dependencies (ML, API, Dashboard)
├── README.md                   # Complete architectural and operational documentation
│
├── data/
│   ├── generate_dataset.py     # Deterministic realistic transit dataset generator
│   └── public_transport_delays.csv # Ingested dataset with 5,000+ trip records
│
├── backend/
│   ├── __init__.py
│   ├── preprocessing.py        # Cyclical transformations, imputation, one-hot encoding
│   ├── train_models.py         # Trains & benchmarks Classification & Regression models
│   └── main.py                 # FastAPI service (/predict, /explain, /metrics, /health)
│
├── models/                     # Exported Joblib artifacts & metrics
│   ├── preprocessor.joblib     # Serialized scikit-learn preprocessor pipeline
│   ├── best_classifier.joblib  # Top classification model (XGBoost / Random Forest)
│   ├── best_regressor.joblib   # Top regression model (LightGBM / XGBoost)
│   ├── shap_explainer.joblib   # Serialized SHAP TreeExplainer
│   └── metrics_summary.json    # Accuracy, F1, ROC-AUC, MAE, RMSE, R² scores
│
└── frontend/
    └── app.py                  # Streamlit multi-tab analytics & prediction UI
```

---

## ⚡ Quickstart & Installation

### 1. Environment Setup
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Generate Dataset & Train ML Models
```bash
# 1. Generate realistic transit dataset (if public_transport_delays.csv is absent)
python3 data/generate_dataset.py

# 2. Train and evaluate all classification and regression models
python3 backend/train_models.py
```

### 3. Launch the FastAPI REST Service
```bash
# Start backend on http://localhost:8000
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation is available at: `http://localhost:8000/docs`

### 4. Launch the Streamlit Dashboard
```bash
# Start Streamlit frontend on http://localhost:8501
streamlit run frontend/app.py
```

---

## 🔬 Machine Learning Pipeline Architecture

### Data Preprocessing (`backend/preprocessing.py`)
1. **Missing Value Imputation**:
   - Numerical attributes (`temperature_c`, `precipitation_mm`, `wind_speed_kmh`, `traffic_congestion_index`): **Median Imputation**.
   - Categorical attributes (`route_id`, `vehicle_type`, `station_origin`, `station_destination`, `weather_condition`): **Mode Imputation**.
   - Binary attributes (`is_holiday`, `major_event_nearby`): **Mode Imputation**.
2. **Cyclical Feature Engineering**:
   - `scheduled_hour`: $\sin(2\pi \cdot \text{hour} / 24)$ and $\cos(2\pi \cdot \text{hour} / 24)$
   - `scheduled_minute`: $\sin(2\pi \cdot \text{min} / 60)$ and $\cos(2\pi \cdot \text{min} / 60)$
   - `day_of_week`: $\sin(2\pi \cdot \text{day} / 7)$ and $\cos(2\pi \cdot \text{day} / 7)$
3. **Categorical Encoding**:
   - `OneHotEncoder(sparse_output=False, handle_unknown="ignore")` applied to route, mode, and station features.
4. **Standardization**:
   - `StandardScaler` applied to continuous environmental metrics.

### Model Benchmarks (`backend/train_models.py`)
- **Classification Models (Threshold: Delay $\ge 5.0$ minutes)**:
  - Logistic Regression (Baseline)
  - Random Forest Classifier (Non-linear ensembles)
  - XGBoost Classifier (Gradient-boosted decision trees)
  - *Metrics*: Accuracy, F1-Score, ROC-AUC, Precision, Recall
- **Regression Models (Delay in Minutes)**:
  - Ridge Regression (L2 regularization)
  - LightGBM Regressor (Leaf-wise histogram gradient boosting)
  - XGBoost Regressor (Depth-wise boosted trees)
  - *Metrics*: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), $R^2$ Score

---

## 🌐 FastAPI REST API Endpoints (`backend/main.py`)

### `GET /`
Returns service status, artifact availability, and route directory.

### `POST /predict`
Evaluates trip delay probability, risk category, and predicted delay minutes.
```json
// Sample Request Body
{
  "trip_id": "TF-8092",
  "route_id": "Route 1 - Downtown Express",
  "vehicle_type": "Bus",
  "station_origin": "Central Station",
  "station_destination": "Grand Terminal",
  "scheduled_hour": 8,
  "scheduled_minute": 30,
  "day_of_week": 0,
  "weather_condition": "Clear",
  "temperature_c": 19.5,
  "precipitation_mm": 0.0,
  "wind_speed_kmh": 12.0,
  "traffic_congestion_index": 0.72,
  "is_holiday": 0,
  "major_event_nearby": 0
}
```

```json
// Sample Response Body
{
  "trip_id": "TF-8092",
  "is_delayed": true,
  "delay_probability": 0.784,
  "risk_category": "High",
  "predicted_delay_minutes": 11.2,
  "confidence_interval": {
    "lower_bound": 9.4,
    "upper_bound": 13.4
  },
  "reliability_score": 21.6,
  "classification_model": "XGBClassifier",
  "regression_model": "LGBMRegressor",
  "status": "success"
}
```

### `POST /explain`
Returns SHAP local attributions for the input trip, separating positive delay drivers from mitigating factors, plus tactical recommendations.

---

## 📊 Streamlit Frontend Features (`frontend/app.py`)
- **Tab 1: Dashboard & Analytics**: Live fleet KPIs, distribution histograms, route delay heatmaps, and full model comparison matrices.
- **Tab 2: Live Prediction & Risk Assessment**: Interactive sliders, timetable dials, and instant risk categorization badges (Low, Moderate, High).
- **Tab 3: Explainability (SHAP)**: Waterfall attribution breakdown charts, individual feature explainers, and real-time dispatcher recommendations.
