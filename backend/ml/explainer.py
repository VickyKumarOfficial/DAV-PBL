"""
Model Explainability Module
Provides interpretable explanations for model predictions using XGBoost feature importance
"""
import joblib
import numpy as np
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import MODEL_PATH, SCALER_PATH, FEATURE_NAMES_PATH, EXPLAINER_PATH, PROCESSED_DATA_PATH


class ModelExplainer:
    """Handles model explanations using XGBoost built-in feature importance"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.feature_importance = None
        
    def load_artifacts(self):
        """Load trained model and preprocessing artifacts"""
        print("Loading model artifacts...")
        
        self.model = joblib.load(MODEL_PATH)
        self.scaler = joblib.load(SCALER_PATH)
        self.feature_names = joblib.load(FEATURE_NAMES_PATH)
        
        print(f"  ✓ Model loaded from {MODEL_PATH}")
        print(f"  ✓ Scaler loaded from {SCALER_PATH}")
        print(f"  ✓ Feature names loaded ({len(self.feature_names)} features)")
        
        return self
    
    def compute_feature_importance(self):
        """Compute and store global feature importance"""
        print("\nComputing feature importance...")
        
        # Get feature importance from XGBoost model
        importances = self.model.feature_importances_
        
        # Create feature importance list
        self.feature_importance = []
        for feat, importance in zip(self.feature_names, importances):
            self.feature_importance.append({
                'feature': feat,
                'importance': float(importance)
            })
        
        # Sort by importance
        self.feature_importance = sorted(self.feature_importance, 
                                        key=lambda x: x['importance'], reverse=True)
        
        # Add rank
        for i, item in enumerate(self.feature_importance):
            item['rank'] = i + 1
        
        print(f"  ✓ Computed importance for {len(self.feature_importance)} features")
        
        return self
    
    def save_explainer_data(self):
        """Save feature importance for reuse"""
        print(f"\nSaving explainability data to {EXPLAINER_PATH}...")
        
        explainer_data = {
            'feature_importance': self.feature_importance,
            'feature_names': self.feature_names
        }
        
        joblib.dump(explainer_data, EXPLAINER_PATH)
        
        print("  ✓ Explainability data saved")
        
        return self
    
    def get_global_feature_importance(self, top_n=20):
        """
        Get global feature importance
        
        Args:
            top_n: Number of top features to return
            
        Returns:
            List of dicts with feature names and importance scores
        """
        return self.feature_importance[:top_n]
    
    def explain_prediction(self, X_instance, top_n=5):
        """
        Explain a single prediction using feature values and global importance
        
        Args:
            X_instance: Single preprocessed instance (1D array or 2D with shape (1, n_features))
            top_n: Number of top contributing features to return
            
        Returns:
            Dict with prediction details and top contributing features
        """
        # Ensure correct shape
        if len(X_instance.shape) == 1:
            X_instance = X_instance.reshape(1, -1)
        
        # Get prediction
        prediction_proba = self.model.predict_proba(X_instance)[0]
        prediction = self.model.predict(X_instance)[0]
        
        # Get feature values for this instance
        feature_values = X_instance[0]
        
        # Create contributions based on feature importance and values
        contributions = []
        for feat_info in self.feature_importance:
            feat_idx = self.feature_names.index(feat_info['feature'])
            feat_val = float(feature_values[feat_idx])
            
            # Approximate impact based on value and importance
            # Positive values with high importance → positive impact
            impact_score = feat_val * feat_info['importance']
            
            contributions.append({
                'feature': feat_info['feature'],
                'value': feat_val,
                'importance': feat_info['importance'],
                'impact_score': impact_score,
                'impact': 'positive' if impact_score > 0 else 'negative'
            })
        
        # Sort by absolute impact score
        contributions = sorted(contributions, key=lambda x: abs(x['impact_score']), reverse=True)
        
        # Prepare result
        confidence = "High" if max(prediction_proba) > 0.75 else ("Medium" if max(prediction_proba) > 0.6 else "Low")
        
        result = {
            'prediction': int(prediction),
            'prediction_label': 'Yes' if prediction == 1 else 'No',
            'probability': {
                'No': float(prediction_proba[0]),
                'Yes': float(prediction_proba[1])
            },
            'confidence': confidence,
            'top_factors': [
                {
                    'feature': c['feature'],
                    'impact': float(c['impact_score']),
                    'direction': c['impact']
                }
                for c in contributions[:top_n]
            ]
        }
        
        return result
    
    def run_explainer_pipeline(self):
        """Execute explainer creation and saving pipeline"""
        print("\n🔍 Starting Explainability Module Setup...\n")
        
        (self.load_artifacts()
         .compute_feature_importance()
         .save_explainer_data())
        
        print("\n✅ Explainability module setup complete!")
        
        return self


if __name__ == "__main__":
    explainer = ModelExplainer()
    explainer.run_explainer_pipeline()
    
    # Display top features
    print("\n" + "="*60)
    print("TOP 15 MOST IMPORTANT FEATURES")
    print("="*60)
    
    top_features = explainer.get_global_feature_importance(top_n=15)
    
    for feat in top_features:
        bar_length = int(feat['importance'] * 50)
        bar = "█" * bar_length
        print(f"{feat['rank']:2d}. {feat['feature']:30s} {bar} {feat['importance']:.4f}")
    
    print("\n" + "="*60)

