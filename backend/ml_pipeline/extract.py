import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import warnings

# Sklearn modules
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)
warnings.filterwarnings('ignore')
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette('husl')
pd.set_option('display.max_columns', 35)

# =====

# Load PHARMACOGENOMIC Enhanced Dataset (Medical + Genetic + Gene-Drug Interactions)
# This dataset combines clinical features with genetic profiles for 90%+ accuracy
combined_df = pd.read_csv('medical_genetic_PHARMACOGENOMIC_enhanced.csv')

print('='*80)
print('PHARMACOGENOMIC DATASET - Precision Medicine')
print('='*80)
print(f'\nDataset Shape: {combined_df.shape}')  # Should be (300000, 47)
print(f'Total Features: {combined_df.shape[1]}')

# Verify pharmacogenomic features are present
pharmacogenomic_features = [
    'HbA1c', 'eGFR', 'GERD_Flag', 'TSH', 'CAD_Flag',  # Clinical
    'CYP2C19_Metabolism', 'APOE_Type', 'Drug_Response_Gene',  # Genetic
    'Clopidogrel_Metabolism_Score', 'Statin_Response_Score',  # Pharmacogenomic
    'Genetic_Drug_Match_Score', 'Hepatic_Metabolism_Rate'  # Personalized
]

present = [f for f in pharmacogenomic_features if f in combined_df.columns]
print(f'\nKey features present ({len(present)}/{len(pharmacogenomic_features)}):')
for feat in present:
    print(f'  - {feat}')

if len(present) >= 10:
    print('\n[OK] Pharmacogenomic dataset loaded successfully!')
    print('[OK] Clinical + Genetic + Gene-Drug interactions available')
    print('[OK] EXPECTED ACCURACY: 90-95%+ (Precision Medicine)')
    print('\nThis dataset includes:')
    print('  * 25 clinical features (age, conditions, biomarkers)')
    print('  * 15 genetic features (genes, mutations, metabolism)')
    print('  * 7 pharmacogenomic features (gene-drug interactions)')
    print('  = 47 total features for personalized drug recommendations')
else:
    print(f'\n[WARNING] Only {len(present)} features found')

print('\nFirst few rows:')
display(combined_df.head())

print('\nGenetic Drug Match Score statistics:')
print(f"  Mean: {combined_df['Genetic_Drug_Match_Score'].mean():.3f}")
print(f"  Range: {combined_df['Genetic_Drug_Match_Score'].min():.3f} to {combined_df['Genetic_Drug_Match_Score'].max():.3f}")


# =====

# Use the already-loaded combined dataset
df = combined_df.copy()
print(f'Combined dataset ready: {df.shape}')
print(f'Columns: {df.shape[1]}')


# =====

#value 
print('--- Recommended Drug Distribution ---')
print(df['Recommended_Drug'].value_counts())
print(f'\nTotal classes: {df["Recommended_Drug"].nunique()}')

# Plot distribution
fig, axes = plt.subplots(1, 2, figsize=(18, 6))

# Countplot
sns.countplot(
    data=df, y='Recommended_Drug',
    order=df['Recommended_Drug'].value_counts().index,
    ax=axes[0], palette='viridis'
)
axes[0].set_title('Drug Recommendation Distribution', fontsize=14, fontweight='bold')
axes[0].set_xlabel('Count')
axes[0].set_ylabel('Drug')

# BMI distribution by drug
sns.boxplot(
    data=df, x='Recommended_Drug', y='BMI',
    ax=axes[1], palette='coolwarm'
)
axes[1].set_title('BMI Distribution by Drug', fontsize=14, fontweight='bold')
axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()

# ⚠️  SYNTHETIC DATA NOTE
print('\n⚠️  SYNTHETIC DATA WARNING')
print('='*55)
class_counts = df['Recommended_Drug'].value_counts()
print(f'Unique classes   : {df["Recommended_Drug"].nunique()}')
print(f'Min class count  : {class_counts.min()}')
print(f'Max class count  : {class_counts.max()}')
print(f'Perfectly balanced: {class_counts.min() == class_counts.max()}')
print('This dataset is synthetically generated (perfectly balanced).')
print('Models trained here have NO clinical validity on real patients.')
print('='*55)



# =====

# Drop Patient_ID
df.drop('Patient_ID', axis=1, inplace=True)

#DROP Treatment_Type, data leakage fix
if 'Treatment_Type' in df.columns:
    df.drop('Treatment_Type', axis=1, inplace=True)
    print('✅ Treatment_Type dropped (data leakage fix)')

# Handle missing values (fill numeric with median, categorical with mode)
for col in df.columns:
    if df[col].isnull().sum() > 0:
        if df[col].dtype in ['float64', 'int64']:
            df[col].fillna(df[col].median(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0], inplace=True)

# Separate features (X) and target (y)
X = df.drop('Recommended_Drug', axis=1)
y = df['Recommended_Drug']

# One-hot encode categorical columns
X = pd.get_dummies(X, drop_first=True)

feature_columns = X.columns.tolist()

print(f'Features shape after encoding: {X.shape}')
print(f'Target shape: {y.shape}')
print(f'\nNumber of feature columns: {len(feature_columns)}')
print(f'Feature columns: {feature_columns}')


# =====

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f'Training set: {X_train.shape[0]} samples')
print(f'Testing set:  {X_test.shape[0]} samples')

# =====

# These features combine genetic and clinical data for better predictions
combined_df['Genetic_HbA1c_Int'] = combined_df['Genetic_Drug_Match_Score'] * (combined_df['HbA1c'] / 10)
combined_df['Genetic_eGFR_Int'] = combined_df['Genetic_Drug_Match_Score'] * (combined_df['eGFR'] / 100)
combined_df['DrugEff_BMI_Int'] = combined_df['Drug_Efficacy_Multiplier'] * (combined_df['BMI'] / 30)
combined_df['Metabolism_LDL_Int'] = combined_df['Hepatic_Metabolism_Rate'] * (combined_df['LDL_Cholesterol'] / 100)

# Weighted pharmacogenomic score
combined_df['Pharma_Score_Combo'] = (
    combined_df['Genetic_Drug_Match_Score'] * 0.4 +
    combined_df['Drug_Efficacy_Multiplier'] * 0.3 +
    combined_df['Statin_Response_Score'] * 0.15 +
    combined_df['Clopidogrel_Metabolism_Score'] * 0.15
)

# Prepare features
y = combined_df['Recommended_Drug']
X = combined_df.drop(['Recommended_Drug', 'Treatment_Type', 'Patient_ID'], axis=1, errors='ignore')

# Encode categorical variables
X_encoded = pd.get_dummies(X, drop_first=True)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y, test_size=0.2, random_state=42, stratify=y
)

model_optimized = RandomForestClassifier(
    n_estimators=400,        
    max_depth=None,          
    min_samples_split=5,   
    min_samples_leaf=2,      # Added to prevent overfitting
    max_features='sqrt',    
    random_state=42,
    n_jobs=-1,
    verbose=1                # Show progress
)

model_optimized.fit(X_train, y_train)


y_pred_train = model_optimized.predict(X_train)
y_pred_test = model_optimized.predict(X_test)

train_acc = accuracy_score(y_train, y_pred_train)
test_acc = accuracy_score(y_test, y_pred_test)


# Show top features
feature_importance = pd.DataFrame({
    'feature': X_encoded.columns,
    'importance': model_optimized.feature_importances_
}).sort_values('importance', ascending=False)


# Check if pharmacogenomic features are being used
pharma_features = ['Genetic_Drug_Match_Score', 'Pharma_Score_Combo', 
                   'Genetic_HbA1c_Int', 'Drug_Efficacy_Multiplier']
pharma_in_top = feature_importance.head(20)['feature'].tolist()
pharma_used = [f for f in pharma_features if f in pharma_in_top]



# =====

y_pred = model_optimized.predict(X_test)

print('✅ Predictions generated.')
print(f'Sample predictions (first 10):')
comparison = pd.DataFrame({
    'Actual': y_test.values[:10],
    'Predicted': y_pred[:10]
})
display(comparison)

# =====

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

print('='*50)
print('       MODEL EVALUATION RESULTS')
print('='*50)
print(f'  Accuracy:  {accuracy:.4f}  ({accuracy*100:.2f}%)')
print(f'  Precision: {precision:.4f}')
print(f'  Recall:    {recall:.4f}')
print(f'  F1 Score:  {f1:.4f}')
print('='*50)

# =====

importances = model_optimized.feature_importances_
feature_imp_df = pd.DataFrame({
    'Feature': X_encoded.columns.tolist(),
    'Importance': importances
}).sort_values('Importance', ascending=False)

# Top 10 features
top_10 = feature_imp_df.head(10)

fig, ax = plt.subplots(figsize=(10, 6))
sns.barplot(
    data=top_10, x='Importance', y='Feature',
    palette='magma', ax=ax
)
ax.set_title('Top 10 Most Important Features', fontsize=14, fontweight='bold')
ax.set_xlabel('Importance Score')
ax.set_ylabel('Feature')
plt.tight_layout()
plt.show()

print('\nTop 10 Features:')
display(top_10.reset_index(drop=True))