# Backend - Mental Health Treatment Predictor

FastAPI backend with XGBoost ML model for predicting mental health treatment likelihood.

## 📋 Overview

This backend processes the OSMI Mental Health in Tech Survey data, trains an XGBoost classifier, and serves predictions via RESTful API with SHAP-based explainability.

## 🛠️ Tech Stack & Libraries

### Core Framework
- **FastAPI** (0.104.1) - Modern, fast web framework for building APIs
- **Uvicorn** (0.24.0) - ASGI server for production
- **Pydantic** (2.5.0) - Data validation using Python type annotations

### Machine Learning
- **XGBoost** (2.0.2) - Gradient boosting classifier (main model)
- **scikit-learn** (1.3.2) - Preprocessing, metrics, train/test split
- **SHAP** (0.43.0) - Model interpretability and feature importance
- **imbalanced-learn** (0.11.0) - Handle class imbalance (SMOTE if needed)

### Data Processing & Analysis
- **pandas** (2.1.3) - Data manipulation and cleaning
- **numpy** (1.26.2) - Numerical operations

### Visualization
- **matplotlib** (3.8.2) - Static plots for EDA
- **seaborn** (0.13.0) - Statistical visualizations
- **plotly** (5.18.0) - Interactive charts

### Utilities
- **joblib** (1.3.2) - Model serialization
- **python-dotenv** (1.0.0) - Environment configuration

## 🚀 Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run ML Pipeline (First Time Only)
```bash
# Step 1: Clean and preprocess data
python ml/data_processing.py

# Step 2: Generate EDA visualizations
python ml/eda.py

# Step 3: Train XGBoost model
python ml/train_model.py
```

This will create:
- `data/processed_survey.csv` - Cleaned dataset
- `outputs/charts/*.png` - EDA visualizations
- `artifacts/*.joblib` - Trained model, scaler, encoders, SHAP explainer

### 4. Start API Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: **http://localhost:8000**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and version |
| GET | `/health` | Health check |
| POST | `/predict` | Predict treatment likelihood |
| GET | `/insights` | Model metrics & feature importance |
| GET | `/charts` | List available EDA charts |
| GET | `/charts/{filename}` | Serve specific chart image |

## 📊 API Documentation

Interactive API docs (once server is running):
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧠 Machine Learning Pipeline

### 1. Data Processing (`ml/data_processing.py`)
**Methods:**
- Age cleaning: Clip outliers to 18-80 range
- Gender standardization: Consolidate 40+ variants into Male/Female/Transgender/Non-binary/Other
- Categorical normalization: Standardize Yes/No/Don't know responses
- Missing value imputation: Mode-based filling for categorical, median for numerical
- Feature engineering: Create age_group and company_size_category

**Output:** `data/processed_survey.csv` (~1,260 rows, 30 columns)

### 2. Exploratory Data Analysis (`ml/eda.py`)
**Visualizations Generated:**
- Age distribution histogram
- Gender distribution bar chart
- Treatment outcome pie chart
- Work interference by treatment status
- Company benefits heatmap
- Mental health consequence analysis
- Country-wise distribution
- Correlation heatmap
- Multiple comparison charts

**Output:** 10-12 PNG charts in `outputs/charts/`

### 3. Model Training (`ml/train_model.py`)
**Algorithm:** XGBoost Classifier

**Key Parameters:**
```python
{
    'n_estimators': 200,
    'max_depth': 6,
    'learning_rate': 0.1,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'random_state': 42,
    'scale_pos_weight': 1.2  # Handle class imbalance
}
```

**Features Used (~25 features):**
- Demographics: Age, Gender, Country
- Workplace: no_employees, remote_work, tech_company
- Benefits: benefits, care_options, wellness_program, seek_help, anonymity
- Perceptions: work_interfere, leave, mental_health_consequence, coworkers, supervisor
- History: family_history, self_employed

**Preprocessing:**
- One-hot encoding for nominal categories
- Label encoding for ordinal features (work_interfere, leave)
- StandardScaler for numerical features
- 80-20 train-test split with stratification

**Evaluation Metrics:**
- ROC-AUC Score
- Precision, Recall, F1-Score (weighted)
- Confusion Matrix
- Classification Report
- 5-Fold Cross-Validation

**Target Accuracy:** 82-88% (based on dataset quality)

### 4. Explainability (`ml/explainer.py`)
**Method:** SHAP (SHapley Additive exPlanations)

**Capabilities:**
- Global feature importance (TreeExplainer)
- Individual prediction explanations
- SHAP waterfall plots
- Force plots for local interpretability

**Output:** Pre-computed SHAP explainer saved to `artifacts/shap_explainer.joblib`

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py          # Package initialization
│   ├── config.py            # Configuration (paths, settings, CORS)
│   ├── main.py              # FastAPI application & routes
│   ├── models.py            # Pydantic request/response schemas
│   └── predict.py           # Prediction logic & model loading
├── ml/
│   ├── __init__.py
│   ├── data_processing.py   # Data cleaning pipeline
│   ├── eda.py               # Exploratory data analysis
│   ├── train_model.py       # XGBoost training & evaluation
│   └── explainer.py         # SHAP integration
├── artifacts/               # Saved model artifacts (generated)
│   ├── xgboost_model.joblib
│   ├── scaler.joblib
│   ├── label_encoders.joblib
│   ├── feature_names.joblib
│   └── shap_explainer.joblib
├── data/                    # Processed datasets (generated)
│   └── processed_survey.csv
├── outputs/                 # Generated visualizations
│   └── charts/              # EDA PNG images
├── requirements.txt         # Python dependencies
└── .gitignore
```

## 🔍 Sample Prediction Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "Age": 30,
    "Gender": "Male",
    "Country": "United States",
    "self_employed": "No",
    "family_history": "Yes",
    "work_interfere": "Sometimes",
    "no_employees": "26-100",
    "remote_work": "Yes",
    "tech_company": "Yes",
    "benefits": "Yes",
    "care_options": "Yes",
    "wellness_program": "No",
    "seek_help": "Yes",
    "anonymity": "Yes",
    "leave": "Somewhat easy",
    "mental_health_consequence": "No",
    "phys_health_consequence": "No",
    "coworkers": "Some of them",
    "supervisor": "Yes",
    "mental_health_interview": "No",
    "phys_health_interview": "Maybe",
    "mental_vs_physical": "Yes",
    "obs_consequence": "No"
  }'
```

**Sample Response:**
```json
{
  "prediction": "Yes",
  "probability": 0.78,
  "confidence": "High",
  "top_factors": [
    {"feature": "family_history", "impact": 0.15},
    {"feature": "work_interfere", "impact": 0.12},
    {"feature": "benefits", "impact": 0.09}
  ]
}
```

## ⚙️ Configuration

Edit `app/config.py` to customize:
- File paths
- Model hyperparameters
- CORS origins (for frontend integration)
- API metadata

## 🧪 Testing

```bash
# Check API health
curl http://localhost:8000/health

# Get model insights
curl http://localhost:8000/insights
```

## 📝 Notes

- **First Run**: Execute ML pipeline scripts before starting API server
- **CORS**: Frontend URLs (localhost:3000, localhost:5173) are pre-configured
- **Model Retraining**: Re-run `ml/train_model.py` after data updates
- **Performance**: API responses typically < 200ms for predictions
