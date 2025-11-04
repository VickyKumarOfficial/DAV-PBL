"""
Exploratory Data Analysis Module
Generates comprehensive visualizations from the processed survey data
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import sys
import warnings
warnings.filterwarnings('ignore')

sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import PROCESSED_DATA_PATH, CHARTS_DIR

# Set style
sns.set_style("whitegrid")
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 10


class EDAAnalyzer:
    """Handles all exploratory data analysis and visualization"""
    
    def __init__(self):
        self.df = None
        self.charts_created = []
        
    def load_data(self):
        """Load processed survey data"""
        print(f"Loading processed data from: {PROCESSED_DATA_PATH}")
        self.df = pd.read_csv(PROCESSED_DATA_PATH)
        print(f"Loaded {len(self.df)} rows and {len(self.df.columns)} columns\n")
        return self
    
    def ensure_output_dir(self):
        """Create output directory if it doesn't exist"""
        CHARTS_DIR.mkdir(parents=True, exist_ok=True)
        return self
    
    def save_chart(self, filename):
        """Save current plot and track it"""
        filepath = CHARTS_DIR / filename
        plt.tight_layout()
        plt.savefig(filepath, dpi=300, bbox_inches='tight')
        plt.close()
        self.charts_created.append(filename)
        print(f"✓ Saved: {filename}")
    
    def plot_age_distribution(self):
        """Plot age distribution"""
        print("Creating age distribution chart...")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        
        # Histogram
        ax1.hist(self.df['Age'], bins=30, edgecolor='black', alpha=0.7, color='skyblue')
        ax1.set_xlabel('Age')
        ax1.set_ylabel('Frequency')
        ax1.set_title('Age Distribution', fontsize=14, fontweight='bold')
        ax1.axvline(self.df['Age'].mean(), color='red', linestyle='--', 
                   label=f'Mean: {self.df["Age"].mean():.1f}')
        ax1.axvline(self.df['Age'].median(), color='green', linestyle='--', 
                   label=f'Median: {self.df["Age"].median():.1f}')
        ax1.legend()
        
        # Box plot by age group
        age_group_order = ['18-25', '26-35', '36-45', '46+']
        sns.boxplot(data=self.df, x='age_group', y='Age', order=age_group_order, ax=ax2)
        ax2.set_title('Age by Age Group', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Age Group')
        ax2.set_ylabel('Age')
        
        self.save_chart('01_age_distribution.png')
        return self
    
    def plot_gender_distribution(self):
        """Plot gender distribution"""
        print("Creating gender distribution chart...")
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        gender_counts = self.df['Gender'].value_counts()
        colors = sns.color_palette('Set2', len(gender_counts))
        
        bars = ax.bar(range(len(gender_counts)), gender_counts.values, color=colors)
        ax.set_xticks(range(len(gender_counts)))
        ax.set_xticklabels(gender_counts.index, rotation=0)
        ax.set_ylabel('Count')
        ax.set_title('Gender Distribution', fontsize=14, fontweight='bold')
        
        # Add count labels on bars
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{int(height)}',
                   ha='center', va='bottom')
        
        self.save_chart('02_gender_distribution.png')
        return self
    
    def plot_treatment_distribution(self):
        """Plot treatment outcome distribution"""
        print("Creating treatment distribution chart...")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Pie chart
        treatment_counts = self.df['treatment'].value_counts()
        colors = ['#66c2a5', '#fc8d62']
        explode = (0.05, 0)
        
        ax1.pie(treatment_counts.values, labels=treatment_counts.index, autopct='%1.1f%%',
               startangle=90, colors=colors, explode=explode, shadow=True)
        ax1.set_title('Treatment Distribution', fontsize=14, fontweight='bold')
        
        # Bar chart by gender
        treatment_by_gender = pd.crosstab(self.df['Gender'], self.df['treatment'], normalize='index') * 100
        treatment_by_gender.plot(kind='bar', ax=ax2, color=colors, width=0.7)
        ax2.set_title('Treatment Rate by Gender', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Gender')
        ax2.set_ylabel('Percentage (%)')
        ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45)
        ax2.legend(title='Treatment', labels=['No', 'Yes'])
        
        self.save_chart('03_treatment_distribution.png')
        return self
    
    def plot_work_interfere_vs_treatment(self):
        """Plot work interference vs treatment"""
        print("Creating work interference analysis...")
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Filter out missing values
        work_treat = self.df[self.df['work_interfere'].notna()]
        
        # Create crosstab
        ct = pd.crosstab(work_treat['work_interfere'], work_treat['treatment'], normalize='index') * 100
        
        # Order properly
        interfere_order = ['Never', 'Rarely', 'Sometimes', 'Often']
        ct = ct.reindex(interfere_order)
        
        ct.plot(kind='bar', ax=ax, color=['#fc8d62', '#66c2a5'], width=0.7)
        ax.set_title('Treatment Seeking by Work Interference Level', fontsize=14, fontweight='bold')
        ax.set_xlabel('Work Interference Level')
        ax.set_ylabel('Percentage (%)')
        ax.set_xticklabels(ax.get_xticklabels(), rotation=0)
        ax.legend(title='Sought Treatment', labels=['No', 'Yes'])
        ax.grid(axis='y', alpha=0.3)
        
        self.save_chart('04_work_interfere_treatment.png')
        return self
    
    def plot_company_size_analysis(self):
        """Plot company size vs treatment"""
        print("Creating company size analysis...")
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Group by company size
        size_order = ['1-5', '6-25', '26-100', '100-500', '500-1000', 'More than 1000']
        
        ct = pd.crosstab(self.df['no_employees'], self.df['treatment'], normalize='index') * 100
        ct = ct.reindex(size_order)
        
        ct.plot(kind='bar', ax=ax, color=['#fc8d62', '#66c2a5'], width=0.7)
        ax.set_title('Treatment Rate by Company Size', fontsize=14, fontweight='bold')
        ax.set_xlabel('Number of Employees')
        ax.set_ylabel('Percentage (%)')
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha='right')
        ax.legend(title='Sought Treatment', labels=['No', 'Yes'])
        ax.grid(axis='y', alpha=0.3)
        
        self.save_chart('05_company_size_treatment.png')
        return self
    
    def plot_benefits_heatmap(self):
        """Plot benefits and policies heatmap"""
        print("Creating benefits availability heatmap...")
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Select relevant columns
        policy_cols = ['benefits', 'care_options', 'wellness_program', 
                      'seek_help', 'anonymity', 'leave']
        
        # Create summary by treatment
        policy_summary = []
        for col in policy_cols:
            yes_pct = (self.df[self.df['treatment'] == 'Yes'][col] == 'Yes').sum() / \
                     len(self.df[self.df['treatment'] == 'Yes']) * 100
            no_pct = (self.df[self.df['treatment'] == 'No'][col] == 'Yes').sum() / \
                    len(self.df[self.df['treatment'] == 'No']) * 100
            policy_summary.append([yes_pct, no_pct])
        
        policy_df = pd.DataFrame(policy_summary, 
                                columns=['Sought Treatment', 'Did Not Seek Treatment'],
                                index=policy_cols)
        
        sns.heatmap(policy_df, annot=True, fmt='.1f', cmap='YlGnBu', ax=ax, 
                   cbar_kws={'label': 'Percentage (%)'})
        ax.set_title('Workplace Policies by Treatment Status', fontsize=14, fontweight='bold')
        ax.set_ylabel('Policy/Benefit')
        
        self.save_chart('06_benefits_heatmap.png')
        return self
    
    def plot_mental_health_consequences(self):
        """Plot mental health consequences perception"""
        print("Creating mental health consequences chart...")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Mental vs Physical consequences
        mh_cons = self.df['mental_health_consequence'].value_counts()
        ph_cons = self.df['phys_health_consequence'].value_counts()
        
        x = np.arange(len(mh_cons))
        width = 0.35
        
        ax1.bar(x - width/2, mh_cons.values, width, label='Mental Health', color='#e78ac3')
        ax1.bar(x + width/2, ph_cons.values, width, label='Physical Health', color='#8da0cb')
        ax1.set_xlabel('Perceived Consequence')
        ax1.set_ylabel('Count')
        ax1.set_title('Perceived Health Consequences at Work', fontsize=14, fontweight='bold')
        ax1.set_xticks(x)
        ax1.set_xticklabels(mh_cons.index, rotation=0)
        ax1.legend()
        
        # Treatment by consequence perception
        consequence_treat = pd.crosstab(self.df['mental_health_consequence'], 
                                       self.df['treatment'], normalize='index') * 100
        
        consequence_treat.plot(kind='barh', ax=ax2, color=['#fc8d62', '#66c2a5'])
        ax2.set_title('Treatment Rate by Consequence Perception', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Percentage (%)')
        ax2.set_ylabel('Mental Health Consequence Perception')
        ax2.legend(title='Treatment', labels=['No', 'Yes'])
        
        self.save_chart('07_mental_health_consequences.png')
        return self
    
    def plot_remote_work_impact(self):
        """Plot remote work vs treatment"""
        print("Creating remote work impact chart...")
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Remote work distribution
        remote_counts = self.df['remote_work'].value_counts()
        ax1.pie(remote_counts.values, labels=remote_counts.index, autopct='%1.1f%%',
               startangle=90, colors=['#a6d854', '#ffd92f'])
        ax1.set_title('Remote Work Distribution', fontsize=14, fontweight='bold')
        
        # Treatment by remote work
        remote_treat = pd.crosstab(self.df['remote_work'], self.df['treatment'], normalize='index') * 100
        remote_treat.plot(kind='bar', ax=ax2, color=['#fc8d62', '#66c2a5'], width=0.6)
        ax2.set_title('Treatment Rate by Remote Work Status', fontsize=14, fontweight='bold')
        ax2.set_xlabel('Remote Work')
        ax2.set_ylabel('Percentage (%)')
        ax2.set_xticklabels(ax2.get_xticklabels(), rotation=0)
        ax2.legend(title='Treatment', labels=['No', 'Yes'])
        
        self.save_chart('08_remote_work_impact.png')
        return self
    
    def plot_family_history(self):
        """Plot family history correlation"""
        print("Creating family history analysis...")
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        family_treat = pd.crosstab(self.df['family_history'], self.df['treatment'], normalize='index') * 100
        
        family_treat.plot(kind='bar', ax=ax, color=['#fc8d62', '#66c2a5'], width=0.6)
        ax.set_title('Treatment Rate by Family History of Mental Health Issues', 
                    fontsize=14, fontweight='bold')
        ax.set_xlabel('Family History')
        ax.set_ylabel('Percentage (%)')
        ax.set_xticklabels(ax.get_xticklabels(), rotation=0)
        ax.legend(title='Sought Treatment', labels=['No', 'Yes'], loc='upper right')
        ax.grid(axis='y', alpha=0.3)
        
        # Add percentage labels
        for container in ax.containers:
            ax.bar_label(container, fmt='%.1f%%')
        
        self.save_chart('09_family_history.png')
        return self
    
    def plot_country_distribution(self):
        """Plot top countries"""
        print("Creating country distribution chart...")
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        top_countries = self.df['Country'].value_counts().head(10)
        
        bars = ax.barh(range(len(top_countries)), top_countries.values, color=sns.color_palette('viridis', 10))
        ax.set_yticks(range(len(top_countries)))
        ax.set_yticklabels(top_countries.index)
        ax.set_xlabel('Count')
        ax.set_title('Top 10 Countries by Respondents', fontsize=14, fontweight='bold')
        ax.invert_yaxis()
        
        # Add count labels
        for i, (bar, count) in enumerate(zip(bars, top_countries.values)):
            ax.text(count, i, f' {count}', va='center')
        
        self.save_chart('10_country_distribution.png')
        return self
    
    def plot_correlation_heatmap(self):
        """Plot feature correlation heatmap"""
        print("Creating correlation heatmap...")
        
        # Select numerical and binary features
        binary_cols = ['self_employed', 'family_history', 'treatment', 'remote_work',
                      'tech_company', 'mental_health_consequence', 'phys_health_consequence',
                      'obs_consequence']
        
        # Convert to binary
        corr_df = self.df[binary_cols + ['Age']].copy()
        for col in binary_cols:
            corr_df[col] = (corr_df[col] == 'Yes').astype(int)
        
        # Compute correlation
        corr_matrix = corr_df.corr()
        
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', center=0,
                   square=True, linewidths=1, ax=ax, cbar_kws={'label': 'Correlation'})
        ax.set_title('Feature Correlation Matrix', fontsize=14, fontweight='bold')
        
        self.save_chart('11_correlation_heatmap.png')
        return self
    
    def plot_leave_difficulty(self):
        """Plot leave difficulty analysis"""
        print("Creating leave difficulty chart...")
        
        fig, ax = plt.subplots(figsize=(12, 6))
        
        leave_df = self.df[self.df['leave'].notna()]
        leave_order = ['Very easy', 'Somewhat easy', "Don't know", 'Somewhat difficult', 'Very difficult']
        
        leave_treat = pd.crosstab(leave_df['leave'], leave_df['treatment'], normalize='index') * 100
        leave_treat = leave_treat.reindex(leave_order)
        
        leave_treat.plot(kind='bar', ax=ax, color=['#fc8d62', '#66c2a5'], width=0.7)
        ax.set_title('Treatment Rate by Difficulty of Taking Leave', fontsize=14, fontweight='bold')
        ax.set_xlabel('Difficulty of Taking Leave')
        ax.set_ylabel('Percentage (%)')
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha='right')
        ax.legend(title='Sought Treatment', labels=['No', 'Yes'])
        ax.grid(axis='y', alpha=0.3)
        
        self.save_chart('12_leave_difficulty.png')
        return self
    
    def generate_summary_stats(self):
        """Print summary statistics"""
        print("\n" + "="*60)
        print("EXPLORATORY DATA ANALYSIS - SUMMARY")
        print("="*60)
        
        print(f"\nTotal Respondents: {len(self.df)}")
        print(f"Treatment Seekers: {(self.df['treatment'] == 'Yes').sum()} ({(self.df['treatment'] == 'Yes').sum() / len(self.df) * 100:.1f}%)")
        print(f"\nAge: {self.df['Age'].min():.0f} - {self.df['Age'].max():.0f} (Mean: {self.df['Age'].mean():.1f})")
        print(f"\nGender Breakdown:")
        print(self.df['Gender'].value_counts())
        print(f"\nTop 5 Countries:")
        print(self.df['Country'].value_counts().head(5))
        print(f"\nTech Companies: {(self.df['tech_company'] == 'Yes').sum()} ({(self.df['tech_company'] == 'Yes').sum() / len(self.df) * 100:.1f}%)")
        print(f"Remote Workers: {(self.df['remote_work'] == 'Yes').sum()} ({(self.df['remote_work'] == 'Yes').sum() / len(self.df) * 100:.1f}%)")
        print(f"Family History: {(self.df['family_history'] == 'Yes').sum()} ({(self.df['family_history'] == 'Yes').sum() / len(self.df) * 100:.1f}%)")
        
        return self
    
    def run_eda_pipeline(self):
        """Execute complete EDA pipeline"""
        print("\n📊 Starting Exploratory Data Analysis...\n")
        
        (self.load_data()
         .ensure_output_dir()
         .plot_age_distribution()
         .plot_gender_distribution()
         .plot_treatment_distribution()
         .plot_work_interfere_vs_treatment()
         .plot_company_size_analysis()
         .plot_benefits_heatmap()
         .plot_mental_health_consequences()
         .plot_remote_work_impact()
         .plot_family_history()
         .plot_country_distribution()
         .plot_correlation_heatmap()
         .plot_leave_difficulty()
         .generate_summary_stats())
        
        print(f"\n✅ EDA Complete! Generated {len(self.charts_created)} charts in {CHARTS_DIR}")
        print(f"\nCharts created:")
        for chart in self.charts_created:
            print(f"  - {chart}")
        
        return self


if __name__ == "__main__":
    analyzer = EDAAnalyzer()
    analyzer.run_eda_pipeline()
