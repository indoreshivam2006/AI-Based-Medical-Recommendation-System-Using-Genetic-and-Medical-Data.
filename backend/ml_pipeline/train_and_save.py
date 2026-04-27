import pandas as pd
import numpy as np
import pickle
import warnings
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

warnings.filterwarnings('ignore')

print("Loading dataset...")
import os
data_path = os.path.join(os.path.dirname(__file__), '../data/medical_genetic_PHARMACOGENOMIC_enhanced.csv')
df = pd.read_csv(data_path)

# Drop unused columns
if 'Patient_ID' in df.columns:
    df.drop('Patient_ID', axis=1, inplace=True)
if 'Treatment_Type' in df.columns:
    df.drop('Treatment_Type', axis=1, inplace=True)

# Derive features as seen in notebook to match the final features expected
df['Genetic_HbA1c_Int'] = df['Genetic_Drug_Match_Score'] * (df['HbA1c'] / 10)
df['Genetic_eGFR_Int'] = df['Genetic_Drug_Match_Score'] * (df['eGFR'] / 100)
df['DrugEff_BMI_Int'] = df['Drug_Efficacy_Multiplier'] * (df['BMI'] / 30)
df['Metabolism_LDL_Int'] = df['Hepatic_Metabolism_Rate'] * (df['LDL_Cholesterol'] / 100)

df['Pharma_Score_Combo'] = (
    df['Genetic_Drug_Match_Score'] * 0.4 +
    df['Drug_Efficacy_Multiplier'] * 0.3 +
    df['Statin_Response_Score'] * 0.15 +
    df['Clopidogrel_Metabolism_Score'] * 0.15
)

# Handle missing values and compute baselines
baselines = {}
for col in df.columns:
    if col == 'Recommended_Drug':
        continue
        
    if df[col].dtype in ['float64', 'int64']:
        val = df[col].median()
        df[col].fillna(val, inplace=True)
    else:
        val = df[col].mode()[0]
        df[col].fillna(val, inplace=True)
    baselines[col] = val

y = df['Recommended_Drug']
X = df.drop('Recommended_Drug', axis=1)

# One-hot encode
X_encoded = pd.get_dummies(X, drop_first=True)
feature_columns = X_encoded.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Training Model on {X_train.shape[0]} samples and {len(feature_columns)} features...")

model_optimized = RandomForestClassifier(
    n_estimators=50,        
    max_depth=15,          
    min_samples_split=10,   
    min_samples_leaf=5,
    max_features='sqrt',    
    random_state=42,
    n_jobs=-1
)

model_optimized.fit(X_train, y_train)

print(f"Saving model and features...")

models_dir = os.path.join(os.path.dirname(__file__), '../models')

with open(os.path.join(models_dir, 'model.pkl'), 'wb') as f:
    pickle.dump(model_optimized, f)

with open(os.path.join(models_dir, 'features.pkl'), 'wb') as f:
    pickle.dump(feature_columns, f)
    
with open(os.path.join(models_dir, 'baselines.pkl'), 'wb') as f:
    pickle.dump(baselines, f)

print("✅ Model successfully trained and saved: models/model.pkl, models/features.pkl, models/baselines.pkl")
