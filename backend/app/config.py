"""
Configuration settings for the application
"""
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
OUTPUTS_DIR = BASE_DIR / "outputs"
CHARTS_DIR = OUTPUTS_DIR / "charts"

# Data files
RAW_DATA_PATH = BASE_DIR.parent / "survey.csv"
PROCESSED_DATA_PATH = DATA_DIR / "processed_survey.csv"

# Model artifacts
MODEL_PATH = ARTIFACTS_DIR / "xgboost_model.joblib"
SCALER_PATH = ARTIFACTS_DIR / "scaler.joblib"
FEATURE_NAMES_PATH = ARTIFACTS_DIR / "feature_names.joblib"
LABEL_ENCODERS_PATH = ARTIFACTS_DIR / "label_encoders.joblib"
EXPLAINER_PATH = ARTIFACTS_DIR / "shap_explainer.joblib"

# Model parameters
RANDOM_STATE = 42
TEST_SIZE = 0.2
CV_FOLDS = 5

# API settings
API_TITLE = "Mental Health Treatment Predictor API"
API_VERSION = "1.0.0"
API_DESCRIPTION = """
Predicts the likelihood of seeking mental health treatment based on 
workplace and demographic factors from the OSMI Mental Health in Tech Survey.
"""

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
