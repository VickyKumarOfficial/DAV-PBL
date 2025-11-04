"""
Data Processing Module
Handles cleaning, transformation, and preprocessing of the mental health survey data
"""
import pandas as pd
import numpy as np
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import RAW_DATA_PATH, PROCESSED_DATA_PATH, DATA_DIR


class DataProcessor:
    """Handles all data cleaning and preprocessing operations"""
    
    def __init__(self):
        self.df = None
        self.quality_report = {}
        
    def load_data(self):
        """Load raw survey data"""
        print(f"Loading data from: {RAW_DATA_PATH}")
        self.df = pd.read_csv(RAW_DATA_PATH)
        print(f"Loaded {len(self.df)} rows and {len(self.df.columns)} columns")
        return self
    
    def generate_quality_report(self):
        """Generate data quality statistics before cleaning"""
        print("\n" + "="*60)
        print("DATA QUALITY REPORT - BEFORE CLEANING")
        print("="*60)
        
        self.quality_report['total_rows'] = len(self.df)
        self.quality_report['total_columns'] = len(self.df.columns)
        
        # Missing values
        missing = self.df.isnull().sum()
        missing_pct = (missing / len(self.df) * 100).round(2)
        
        print(f"\nTotal Rows: {len(self.df)}")
        print(f"Total Columns: {len(self.df.columns)}")
        
        print("\nMissing Values (top 10):")
        missing_df = pd.DataFrame({
            'Column': missing.index,
            'Missing': missing.values,
            'Percentage': missing_pct.values
        }).sort_values('Missing', ascending=False).head(10)
        print(missing_df.to_string(index=False))
        
        # Age statistics
        print("\nAge Distribution (Before Cleaning):")
        print(f"  Min: {self.df['Age'].min()}")
        print(f"  Max: {self.df['Age'].max()}")
        print(f"  Mean: {self.df['Age'].mean():.2f}")
        print(f"  Median: {self.df['Age'].median():.2f}")
        
        # Gender variations
        print(f"\nGender Unique Values ({self.df['Gender'].nunique()}):")
        print(self.df['Gender'].value_counts().head(15))
        
        # Treatment distribution
        print("\nTreatment Distribution:")
        print(self.df['treatment'].value_counts())
        
        return self
    
    def clean_age(self):
        """Clean and normalize age column"""
        print("\nCleaning Age column...")
        
        # Handle negative ages and unrealistic values
        # Cap age between 18 and 80
        self.df['Age'] = pd.to_numeric(self.df['Age'], errors='coerce')
        
        # Count outliers
        outliers = ((self.df['Age'] < 18) | (self.df['Age'] > 80)).sum()
        print(f"  Found {outliers} age outliers (< 18 or > 80)")
        
        # Clip ages
        self.df['Age'] = self.df['Age'].clip(lower=18, upper=80)
        
        # Fill any remaining NaN with median
        median_age = self.df['Age'].median()
        self.df['Age'].fillna(median_age, inplace=True)
        
        print(f"  Age range after cleaning: {self.df['Age'].min():.0f} - {self.df['Age'].max():.0f}")
        
        return self
    
    def clean_gender(self):
        """Standardize gender categories"""
        print("\nStandardizing Gender column...")
        
        # Convert to lowercase for easier matching
        gender_lower = self.df['Gender'].str.lower().str.strip()
        
        # Define mapping
        male_variants = ['m', 'male', 'mail', 'maile', 'mal', 'make', 'man', 
                        'msle', 'cis male', 'cis man', 'male-ish', 'malr', 
                        'ostensibly male', 'something kinda male?']
        
        female_variants = ['f', 'female', 'woman', 'femail', 'femake', 'cis female',
                          'cis-female/femme', 'female (cis)', 'female (trans)']
        
        trans_variants = ['trans-female', 'trans woman', 'trans male', 'transgender']
        
        # Map to standardized categories
        def standardize_gender(g):
            if pd.isna(g):
                return 'Prefer not to say'
            g_lower = str(g).lower().strip()
            
            if g_lower in male_variants:
                return 'Male'
            elif g_lower in female_variants:
                return 'Female'
            elif any(trans in g_lower for trans in trans_variants):
                return 'Transgender'
            elif g_lower in ['non-binary', 'genderqueer', 'androgyne', 'agender']:
                return 'Non-binary'
            else:
                return 'Other'
        
        self.df['Gender'] = self.df['Gender'].apply(standardize_gender)
        
        print("  Gender distribution after standardization:")
        print(self.df['Gender'].value_counts())
        
        return self
    
    def clean_categorical_fields(self):
        """Clean and standardize categorical fields"""
        print("\nCleaning categorical fields...")
        
        # List of yes/no columns
        yes_no_cols = ['self_employed', 'family_history', 'treatment', 'remote_work',
                       'tech_company', 'seek_help', 'anonymity', 
                       'mental_health_consequence', 'phys_health_consequence',
                       'obs_consequence']
        
        for col in yes_no_cols:
            if col in self.df.columns:
                # Standardize Yes/No values
                self.df[col] = self.df[col].replace({
                    'Yes': 'Yes', 'yes': 'Yes', 'YES': 'Yes',
                    'No': 'No', 'no': 'No', 'NO': 'No',
                    'NA': np.nan, 'na': np.nan, '': np.nan
                })
        
        # work_interfere - ordinal
        if 'work_interfere' in self.df.columns:
            valid_interfere = ['Never', 'Rarely', 'Sometimes', 'Often']
            self.df['work_interfere'] = self.df['work_interfere'].apply(
                lambda x: x if x in valid_interfere else np.nan
            )
        
        # benefits, care_options, wellness_program - Yes/No/Don't know
        three_way_cols = ['benefits', 'care_options', 'wellness_program']
        for col in three_way_cols:
            if col in self.df.columns:
                self.df[col] = self.df[col].replace({
                    'Yes': 'Yes', 'No': 'No', "Don't know": "Don't know",
                    'Not sure': "Don't know", 'NA': np.nan
                })
        
        # no_employees - keep as is (already categorical)
        # leave - difficulty taking leave
        if 'leave' in self.df.columns:
            valid_leave = ['Very easy', 'Somewhat easy', 'Somewhat difficult', 
                          'Very difficult', "Don't know"]
            self.df['leave'] = self.df['leave'].apply(
                lambda x: x if x in valid_leave else "Don't know"
            )
        
        print("  Categorical fields standardized")
        
        return self
    
    def handle_missing_values(self):
        """Handle missing values strategically"""
        print("\nHandling missing values...")
        
        # Drop rows where treatment (target) is missing
        before = len(self.df)
        self.df = self.df.dropna(subset=['treatment'])
        after = len(self.df)
        print(f"  Dropped {before - after} rows with missing treatment value")
        
        # For critical features, fill with 'Unknown' or mode
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if col not in ['Timestamp', 'comments']:
                missing_count = self.df[col].isna().sum()
                if missing_count > 0:
                    # Fill with 'Unknown' for most columns
                    if col in ['state', 'Country']:
                        self.df[col].fillna('Unknown', inplace=True)
                    else:
                        # Fill with mode for others
                        mode_val = self.df[col].mode()[0] if len(self.df[col].mode()) > 0 else 'Unknown'
                        self.df[col].fillna(mode_val, inplace=True)
                    
                    print(f"  Filled {missing_count} missing values in '{col}'")
        
        return self
    
    def create_derived_features(self):
        """Create useful derived features"""
        print("\nCreating derived features...")
        
        # Age groups
        self.df['age_group'] = pd.cut(self.df['Age'], 
                                      bins=[0, 25, 35, 45, 100],
                                      labels=['18-25', '26-35', '36-45', '46+'])
        
        # Company size category
        size_mapping = {
            '1-5': 'Small',
            '6-25': 'Small',
            '26-100': 'Medium',
            '100-500': 'Large',
            '500-1000': 'Large',
            'More than 1000': 'Very Large'
        }
        self.df['company_size_category'] = self.df['no_employees'].map(size_mapping)
        
        print("  Created age_group and company_size_category features")
        
        return self
    
    def save_processed_data(self):
        """Save cleaned data to file"""
        print(f"\nSaving processed data to: {PROCESSED_DATA_PATH}")
        
        # Ensure directory exists
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        # Save processed data
        self.df.to_csv(PROCESSED_DATA_PATH, index=False)
        
        print(f"✓ Saved {len(self.df)} rows to {PROCESSED_DATA_PATH}")
        
        # Final summary
        print("\n" + "="*60)
        print("DATA PROCESSING COMPLETE")
        print("="*60)
        print(f"Final dataset shape: {self.df.shape}")
        print(f"Target distribution:")
        print(self.df['treatment'].value_counts())
        print(f"\nMissing values remaining: {self.df.isnull().sum().sum()}")
        
        return self
    
    def run_pipeline(self):
        """Execute the complete data processing pipeline"""
        print("\n🚀 Starting Data Processing Pipeline...\n")
        
        (self.load_data()
         .generate_quality_report()
         .clean_age()
         .clean_gender()
         .clean_categorical_fields()
         .handle_missing_values()
         .create_derived_features()
         .save_processed_data())
        
        print("\n✅ Data processing pipeline completed successfully!")
        
        return self.df


if __name__ == "__main__":
    processor = DataProcessor()
    processed_df = processor.run_pipeline()
