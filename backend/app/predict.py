"""
Prediction logic and model loading
"""
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import (MODEL_PATH, SCALER_PATH, FEATURE_NAMES_PATH,
                        LABEL_ENCODERS_PATH, EXPLAINER_PATH)
from ml.explainer import ModelExplainer


class PredictionService:
    """Handles model loading and predictions"""
    
    _instance = None
    _model = None
    _scaler = None
    _feature_names = None
    _label_encoders = None
    _explainer_data = None
    
    def __new__(cls):
        """Singleton pattern to load model only once"""
        if cls._instance is None:
            cls._instance = super(PredictionService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance
    
    def _load_model(self):
        """Load model and preprocessing artifacts"""
        print("Loading model artifacts...")
        
        self._model = joblib.load(MODEL_PATH)
        self._scaler = joblib.load(SCALER_PATH)
        self._feature_names = joblib.load(FEATURE_NAMES_PATH)
        self._label_encoders = joblib.load(LABEL_ENCODERS_PATH)
        self._explainer_data = joblib.load(EXPLAINER_PATH)
        
        print("✓ All artifacts loaded successfully")
    
    def preprocess_input(self, input_data: dict) -> np.ndarray:
        """
        Preprocess input data to match training pipeline
        
        Args:
            input_data: Dict with user input
            
        Returns:
            Preprocessed numpy array ready for prediction
        """
        # Create DataFrame from input
        df = pd.DataFrame([input_data])
        
        # Add derived features
        df['age_group'] = pd.cut(df['Age'], 
                                bins=[0, 25, 35, 45, 100],
                                labels=['18-25', '26-35', '36-45', '46+'])
        
        size_mapping = {
            '1-5': 'Small',
            '6-25': 'Small',
            '26-100': 'Medium',
            '100-500': 'Large',
            '500-1000': 'Large',
            'More than 1000': 'Very Large'
        }
        df['company_size_category'] = df['no_employees'].map(size_mapping)
        
        # Define feature types (same as training)
        ordinal_features = {
            'work_interfere': ['Never', 'Rarely', 'Sometimes', 'Often'],
            'leave': ['Very easy', 'Somewhat easy', "Don't know", 'Somewhat difficult', 'Very difficult'],
            'no_employees': ['1-5', '6-25', '26-100', '100-500', '500-1000', 'More than 1000'],
            'age_group': ['18-25', '26-35', '36-45', '46+']
        }
        
        binary_features = ['self_employed', 'family_history', 'remote_work', 'tech_company',
                          'seek_help', 'anonymity', 'mental_health_consequence',
                          'phys_health_consequence', 'obs_consequence']
        
        three_way_features = ['benefits', 'care_options', 'wellness_program']
        
        nominal_features = ['Gender', 'Country', 'coworkers', 'supervisor',
                           'mental_health_interview', 'phys_health_interview',
                           'mental_vs_physical', 'company_size_category']
        
        # Process ordinal features
        for feat, order in ordinal_features.items():
            if feat in df.columns:
                # Use saved label encoder if available
                if feat in self._label_encoders:
                    le = self._label_encoders[feat]
                    val = df[feat].iloc[0]
                    if val in order:
                        df[feat] = le.transform([val])
                    else:
                        # Use middle value for unknowns
                        df[feat] = len(order) // 2
        
        # Process binary features
        for feat in binary_features:
            if feat in df.columns:
                df[feat] = (df[feat] == 'Yes').astype(int)
        
        # Process three-way features (one-hot encode)
        for feat in three_way_features:
            if feat in df.columns:
                dummies = pd.get_dummies(df[feat], prefix=feat, drop_first=False)
                df = pd.concat([df, dummies], axis=1)
                df.drop(feat, axis=1, inplace=True)
        
        # Process nominal features (one-hot encode, handle unseen categories)
        for feat in nominal_features:
            if feat in df.columns:
                # Group rare categories as 'Other'
                val = df[feat].iloc[0]
                
                # Create dummies
                dummies = pd.get_dummies(df[feat], prefix=feat, drop_first=True)
                df = pd.concat([df, dummies], axis=1)
                df.drop(feat, axis=1, inplace=True)
        
        # Ensure all expected features are present
        for feat in self._feature_names:
            if feat not in df.columns:
                df[feat] = 0  # Add missing features as 0
        
        # Select only the features used in training, in correct order
        X = df[self._feature_names].values
        
        # Scale features
        X_scaled = self._scaler.transform(X)
        
        return X_scaled
    
    def predict(self, input_data: dict) -> dict:
        """
        Make prediction with explanation
        
        Args:
            input_data: Dict with user input
            
        Returns:
            Dict with prediction, probability, confidence, and top factors
        """
        # Preprocess input
        X = self.preprocess_input(input_data)
        
        # Get prediction
        prediction_proba = self._model.predict_proba(X)[0]
        prediction = self._model.predict(X)[0]
        
        # Determine confidence
        max_prob = max(prediction_proba)
        if max_prob > 0.75:
            confidence = "High"
        elif max_prob > 0.6:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Get top contributing factors
        feature_values = X[0]
        feature_importance = self._explainer_data['feature_importance']
        
        contributions = []
        for feat_info in feature_importance:
            feat_idx = self._feature_names.index(feat_info['feature'])
            feat_val = float(feature_values[feat_idx])
            
            # Approximate impact
            impact_score = feat_val * feat_info['importance']
            
            contributions.append({
                'feature': feat_info['feature'],
                'impact': impact_score,
                'direction': 'positive' if impact_score > 0 else 'negative'
            })
        
        # Sort by absolute impact
        contributions = sorted(contributions, key=lambda x: abs(x['impact']), reverse=True)
        
        # Prepare result
        result = {
            'prediction': 'Yes' if prediction == 1 else 'No',
            'probability': {
                'No': float(prediction_proba[0]),
                'Yes': float(prediction_proba[1])
            },
            'confidence': confidence,
            'top_factors': contributions[:5]
        }
        
        return result
    
    def get_feature_importance(self, top_n=20):
        """Get top N most important features"""
        return self._explainer_data['feature_importance'][:top_n]


# Global instance
prediction_service = PredictionService()
