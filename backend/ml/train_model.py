"""
Model Training Module
Trains XGBoost classifier for mental health treatment prediction
"""
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
import sys
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (classification_report, confusion_matrix, roc_auc_score,
                            roc_curve, precision_recall_curve, f1_score)
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import (PROCESSED_DATA_PATH, MODEL_PATH, SCALER_PATH,
                        FEATURE_NAMES_PATH, LABEL_ENCODERS_PATH,
                        RANDOM_STATE, TEST_SIZE, CV_FOLDS, CHARTS_DIR, ARTIFACTS_DIR)


class ModelTrainer:
    """Handles model training, evaluation, and saving"""
    
    def __init__(self):
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.model = None
        self.scaler = None
        self.label_encoders = {}
        self.feature_names = None
        self.metrics = {}
        
    def load_data(self):
        """Load processed data"""
        print(f"Loading data from: {PROCESSED_DATA_PATH}")
        self.df = pd.read_csv(PROCESSED_DATA_PATH)
        print(f"Loaded {len(self.df)} rows\n")
        return self
    
    def prepare_features(self):
        """Engineer and select features for modeling"""
        print("Preparing features...")
        
        # Define feature columns (exclude target, IDs, timestamps, comments)
        exclude_cols = ['Timestamp', 'treatment', 'comments', 'state']
        
        # Select features
        feature_cols = [col for col in self.df.columns if col not in exclude_cols]
        
        # Define ordinal vs nominal features
        ordinal_features = {
            'work_interfere': ['Never', 'Rarely', 'Sometimes', 'Often'],
            'leave': ['Very easy', 'Somewhat easy', "Don't know", 'Somewhat difficult', 'Very difficult'],
            'no_employees': ['1-5', '6-25', '26-100', '100-500', '500-1000', 'More than 1000'],
            'age_group': ['18-25', '26-35', '36-45', '46+']
        }
        
        # Binary features (Yes/No)
        binary_features = ['self_employed', 'family_history', 'remote_work', 'tech_company',
                          'seek_help', 'anonymity', 'mental_health_consequence',
                          'phys_health_consequence', 'obs_consequence']
        
        # Three-way features (Yes/No/Don't know)
        three_way_features = ['benefits', 'care_options', 'wellness_program']
        
        # Nominal categorical features
        nominal_features = ['Gender', 'Country', 'coworkers', 'supervisor',
                           'mental_health_interview', 'phys_health_interview',
                           'mental_vs_physical', 'company_size_category']
        
        # Create feature matrix
        X = self.df[feature_cols].copy()
        
        # Handle ordinal features - label encode with proper order
        for feat, order in ordinal_features.items():
            if feat in X.columns:
                le = LabelEncoder()
                le.classes_ = np.array(order)
                # Map values, fill unknowns with middle value
                X[feat] = X[feat].apply(lambda x: x if x in order else order[len(order)//2])
                X[feat] = le.transform(X[feat])
                self.label_encoders[feat] = le
        
        # Handle binary features - convert to 0/1
        for feat in binary_features:
            if feat in X.columns:
                X[feat] = (X[feat] == 'Yes').astype(int)
        
        # Handle three-way features - one-hot encode
        for feat in three_way_features:
            if feat in X.columns:
                dummies = pd.get_dummies(X[feat], prefix=feat, drop_first=False)
                X = pd.concat([X, dummies], axis=1)
                X.drop(feat, axis=1, inplace=True)
        
        # Handle nominal features - one-hot encode (keep top categories, group rare ones)
        for feat in nominal_features:
            if feat in X.columns:
                # Keep top 10 categories, group others as 'Other'
                top_cats = X[feat].value_counts().head(10).index
                X[feat] = X[feat].apply(lambda x: x if x in top_cats else 'Other')
                
                dummies = pd.get_dummies(X[feat], prefix=feat, drop_first=True)
                X = pd.concat([X, dummies], axis=1)
                X.drop(feat, axis=1, inplace=True)
        
        # Ensure Age is numeric
        if 'Age' in X.columns:
            X['Age'] = pd.to_numeric(X['Age'], errors='coerce').fillna(X['Age'].median())
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        print(f"  Total features: {len(self.feature_names)}")
        print(f"  Feature types: Ordinal ({len(ordinal_features)}), Binary ({len(binary_features)}), "
              f"Nominal ({len(nominal_features)})")
        
        # Prepare target
        y = (self.df['treatment'] == 'Yes').astype(int)
        
        return X, y
    
    def split_data(self, X, y):
        """Split into train and test sets"""
        print(f"\nSplitting data (test_size={TEST_SIZE}, random_state={RANDOM_STATE})...")
        
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
        )
        
        print(f"  Training set: {len(self.X_train)} samples")
        print(f"  Test set: {len(self.X_test)} samples")
        print(f"  Train class distribution: {self.y_train.value_counts().to_dict()}")
        print(f"  Test class distribution: {self.y_test.value_counts().to_dict()}")
        
        return self
    
    def scale_features(self):
        """Scale numerical features"""
        print("\nScaling features...")
        
        self.scaler = StandardScaler()
        self.X_train = self.scaler.fit_transform(self.X_train)
        self.X_test = self.scaler.transform(self.X_test)
        
        print("  Features scaled using StandardScaler")
        
        return self
    
    def train_xgboost(self):
        """Train XGBoost classifier"""
        print("\nTraining XGBoost classifier...")
        
        # Calculate scale_pos_weight for class imbalance
        neg_count = (self.y_train == 0).sum()
        pos_count = (self.y_train == 1).sum()
        scale_pos_weight = neg_count / pos_count
        
        print(f"  Class imbalance ratio: {scale_pos_weight:.2f}")
        
        # XGBoost parameters
        params = {
            'n_estimators': 200,
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 1,
            'gamma': 0,
            'reg_alpha': 0.1,
            'reg_lambda': 1,
            'scale_pos_weight': scale_pos_weight,
            'random_state': RANDOM_STATE,
            'n_jobs': -1,
            'eval_metric': 'logloss'
        }
        
        print(f"  Model parameters: {params}")
        
        # Train model
        self.model = xgb.XGBClassifier(**params)
        self.model.fit(self.X_train, self.y_train,
                      eval_set=[(self.X_test, self.y_test)],
                      verbose=False)
        
        print("  ✓ Model training complete")
        
        return self
    
    def cross_validate(self):
        """Perform cross-validation"""
        print(f"\nPerforming {CV_FOLDS}-fold cross-validation...")
        
        cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)
        
        cv_scores = cross_val_score(self.model, self.X_train, self.y_train,
                                    cv=cv, scoring='roc_auc', n_jobs=-1)
        
        print(f"  CV ROC-AUC scores: {cv_scores}")
        print(f"  Mean CV ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        self.metrics['cv_roc_auc_mean'] = cv_scores.mean()
        self.metrics['cv_roc_auc_std'] = cv_scores.std()
        
        return self
    
    def evaluate_model(self):
        """Evaluate model on test set"""
        print("\nEvaluating model on test set...")
        
        # Predictions
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        
        # Metrics
        roc_auc = roc_auc_score(self.y_test, y_pred_proba)
        f1 = f1_score(self.y_test, y_pred, average='weighted')
        
        print(f"\n  ROC-AUC Score: {roc_auc:.4f}")
        print(f"  F1 Score (weighted): {f1:.4f}")
        
        print("\nClassification Report:")
        print(classification_report(self.y_test, y_pred, target_names=['No Treatment', 'Treatment']))
        
        print("\nConfusion Matrix:")
        cm = confusion_matrix(self.y_test, y_pred)
        print(cm)
        
        # Store metrics
        self.metrics['test_roc_auc'] = roc_auc
        self.metrics['test_f1'] = f1
        self.metrics['confusion_matrix'] = cm.tolist()
        
        return self
    
    def plot_evaluation_charts(self):
        """Generate evaluation visualizations"""
        print("\nGenerating evaluation charts...")
        
        CHARTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Predictions
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        
        # 1. Confusion Matrix
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        
        cm = confusion_matrix(self.y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax1,
                   xticklabels=['No', 'Yes'], yticklabels=['No', 'Yes'])
        ax1.set_title('Confusion Matrix', fontsize=14, fontweight='bold')
        ax1.set_ylabel('Actual')
        ax1.set_xlabel('Predicted')
        
        # 2. ROC Curve
        fpr, tpr, _ = roc_curve(self.y_test, y_pred_proba)
        roc_auc = roc_auc_score(self.y_test, y_pred_proba)
        
        ax2.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc:.3f})')
        ax2.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random Classifier')
        ax2.set_xlim([0.0, 1.0])
        ax2.set_ylim([0.0, 1.05])
        ax2.set_xlabel('False Positive Rate')
        ax2.set_ylabel('True Positive Rate')
        ax2.set_title('ROC Curve', fontsize=14, fontweight='bold')
        ax2.legend(loc="lower right")
        ax2.grid(alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(CHARTS_DIR / '13_model_evaluation.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("  ✓ Saved: 13_model_evaluation.png")
        
        # 3. Feature Importance
        fig, ax = plt.subplots(figsize=(10, 8))
        
        importances = self.model.feature_importances_
        indices = np.argsort(importances)[-20:]  # Top 20 features
        
        ax.barh(range(len(indices)), importances[indices], color='skyblue')
        ax.set_yticks(range(len(indices)))
        ax.set_yticklabels([self.feature_names[i] for i in indices])
        ax.set_xlabel('Feature Importance')
        ax.set_title('Top 20 Feature Importances (XGBoost)', fontsize=14, fontweight='bold')
        ax.grid(axis='x', alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(CHARTS_DIR / '14_feature_importance.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("  ✓ Saved: 14_feature_importance.png")
        
        return self
    
    def save_artifacts(self):
        """Save model and preprocessing artifacts"""
        print("\nSaving model artifacts...")
        
        # Ensure directory exists
        ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save model
        joblib.dump(self.model, MODEL_PATH)
        print(f"  ✓ Model saved: {MODEL_PATH}")
        
        # Save scaler
        joblib.dump(self.scaler, SCALER_PATH)
        print(f"  ✓ Scaler saved: {SCALER_PATH}")
        
        # Save feature names
        joblib.dump(self.feature_names, FEATURE_NAMES_PATH)
        print(f"  ✓ Feature names saved: {FEATURE_NAMES_PATH}")
        
        # Save label encoders
        joblib.dump(self.label_encoders, LABEL_ENCODERS_PATH)
        print(f"  ✓ Label encoders saved: {LABEL_ENCODERS_PATH}")
        
        # Save metrics
        metrics_path = ARTIFACTS_DIR / 'metrics.joblib'
        joblib.dump(self.metrics, metrics_path)
        print(f"  ✓ Metrics saved: {metrics_path}")
        
        return self
    
    def print_summary(self):
        """Print training summary"""
        print("\n" + "="*60)
        print("MODEL TRAINING SUMMARY")
        print("="*60)
        print(f"Algorithm: XGBoost Classifier")
        print(f"Total Features: {len(self.feature_names)}")
        print(f"Training Samples: {len(self.X_train)}")
        print(f"Test Samples: {len(self.X_test)}")
        print(f"\nPerformance Metrics:")
        print(f"  Cross-Validation ROC-AUC: {self.metrics['cv_roc_auc_mean']:.4f} (+/- {self.metrics['cv_roc_auc_std']:.4f})")
        print(f"  Test ROC-AUC: {self.metrics['test_roc_auc']:.4f}")
        print(f"  Test F1 Score: {self.metrics['test_f1']:.4f}")
        print(f"\nAll artifacts saved to: {ARTIFACTS_DIR}")
        print("="*60)
        
        return self
    
    def run_training_pipeline(self):
        """Execute complete training pipeline"""
        print("\n🤖 Starting Model Training Pipeline...\n")
        
        self.load_data()
        X, y = self.prepare_features()
        (self.split_data(X, y)
         .scale_features()
         .train_xgboost()
         .cross_validate()
         .evaluate_model()
         .plot_evaluation_charts()
         .save_artifacts()
         .print_summary())
        
        print("\n✅ Model training pipeline completed successfully!")
        
        return self


if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.run_training_pipeline()
