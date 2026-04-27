from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import uvicorn
from typing import Dict, Any, Optional

app = FastAPI(title="Genovix Medical Recommendation API")

# Setup CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading model and configuration...")
try:
    with open('models/model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('models/features.pkl', 'rb') as f:
        expected_features = pickle.load(f)
    with open('models/baselines.pkl', 'rb') as f:
        baselines = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model artifacts: {e}")

class PredictionRequest(BaseModel):
    # Core 10 inputs from the frontend (always required)
    Age: float
    Gender: str
    BMI: float
    eGFR: float
    HbA1c: float
    TSH: float
    LDL_Cholesterol: float
    # Medical history flags
    Diabetes: Optional[int] = 0
    Hypertension: Optional[int] = 0
    Heart_Disease: Optional[int] = 0

    # --- Advanced Mode: Vital Signs & Labs ---
    Blood_Pressure: Optional[float] = None
    Heart_Rate: Optional[float] = None
    Cholesterol: Optional[float] = None
    Fasting_Glucose: Optional[float] = None
    WBC: Optional[float] = None
    ACR: Optional[float] = None

    # --- Advanced Mode: Lifestyle Factors ---
    Smoking_Status: Optional[str] = None
    Alcohol_Intake: Optional[str] = None

    # --- Advanced Mode: Condition Flags ---
    Asthma: Optional[int] = None
    Thyroid: Optional[int] = None
    Infection: Optional[int] = None
    GERD_Flag: Optional[int] = None
    CAD_Flag: Optional[int] = None

    # --- Advanced Mode: Genetic & Pharmacogenomic ---
    Genetic_Risk_Score: Optional[float] = None
    Genetic_Drug_Match_Score: Optional[float] = None
    Drug_Efficacy_Multiplier: Optional[float] = None
    Statin_Response_Score: Optional[float] = None
    Clopidogrel_Metabolism_Score: Optional[float] = None
    Hepatic_Metabolism_Rate: Optional[float] = None
    CYP2C19_Metabolism: Optional[str] = None
    Anti_Inflammatory_Response: Optional[float] = None
    Polygenic_Risk_Index: Optional[float] = None
    Genetic_Contraindication_Flag: Optional[int] = None

    # Additional data can be passed if needed
    extra: Optional[Dict[str, Any]] = {}

DRUG_DATABASE = {
    "Metformin": {
        "class": "Biguanide (Antidiabetic)",
        "description": "First-line oral medication for type 2 diabetes. Lowers blood glucose by reducing liver glucose production and improving insulin sensitivity.",
        "conditions": ["Type 2 Diabetes", "Prediabetes", "PCOS"],
        "patient_type": "Patients with Type 2 Diabetes, often first medication prescribed. Also used for insulin resistance and polycystic ovary syndrome.",
        "icon": "pill"
    },
    "Insulin": {
        "class": "Hormone (Antidiabetic)",
        "description": "Essential hormone therapy for managing blood sugar levels when the body cannot produce sufficient insulin naturally.",
        "conditions": ["Type 1 Diabetes", "Type 2 Diabetes", "Gestational Diabetes", "Diabetic Ketoacidosis"],
        "patient_type": "Patients with Type 1 Diabetes (always required), Type 2 Diabetes when oral medications are insufficient, and gestational diabetes.",
        "icon": "syringe"
    },
    "Amlodipine": {
        "class": "Calcium Channel Blocker",
        "description": "Relaxes and widens blood vessels to lower blood pressure and improve blood flow to the heart. Used for hypertension and angina.",
        "conditions": ["Hypertension", "Chronic Stable Angina", "Vasospastic Angina", "Coronary Artery Disease"],
        "patient_type": "Patients with high blood pressure (hypertension), chest pain (angina), and coronary artery disease.",
        "icon": "heart"
    },
    "Losartan": {
        "class": "Angiotensin II Receptor Blocker (ARB)",
        "description": "Blocks substances that tighten blood vessels, allowing them to relax. Lowers blood pressure and protects kidneys in diabetic patients.",
        "conditions": ["Hypertension", "Diabetic Nephropathy", "Stroke Prevention", "Left Ventricular Hypertrophy"],
        "patient_type": "Patients with high blood pressure, especially those with Type 2 Diabetes and kidney disease (diabetic nephropathy).",
        "icon": "heart"
    },
    "Atorvastatin": {
        "class": "Statin (HMG-CoA Reductase Inhibitor)",
        "description": "Lowers LDL ('bad') cholesterol and triglycerides while increasing HDL ('good') cholesterol. Reduces cardiovascular risk.",
        "conditions": ["High Cholesterol", "Hyperlipidemia", "Cardiovascular Disease Prevention", "Coronary Heart Disease"],
        "patient_type": "Patients with high LDL cholesterol, those at risk of heart attack or stroke, and patients with coronary heart disease.",
        "icon": "activity"
    },
    "Rosuvastatin": {
        "class": "Statin (HMG-CoA Reductase Inhibitor)",
        "description": "Potent statin that lowers LDL cholesterol and triglycerides. Slows atherosclerosis progression and prevents cardiovascular events.",
        "conditions": ["High Cholesterol", "Hyperlipidemia", "Atherosclerosis", "Cardiovascular Prevention"],
        "patient_type": "Patients with high cholesterol requiring aggressive lipid-lowering therapy, and those at risk of heart attack or stroke.",
        "icon": "activity"
    },
    "Aspirin": {
        "class": "NSAID / Antiplatelet Agent",
        "description": "At low doses, prevents blood clots by inhibiting platelet aggregation. At higher doses, relieves pain and reduces fever.",
        "conditions": ["Heart Attack Prevention", "Stroke Prevention", "Coronary Artery Disease", "Pain Relief", "Fever"],
        "patient_type": "Patients with heart disease, history of heart attack or stroke, and coronary artery disease (low-dose). Also for mild pain and fever.",
        "icon": "shield"
    },
    "Clopidogrel": {
        "class": "Antiplatelet Agent (P2Y12 Inhibitor)",
        "description": "Prevents blood clots by stopping platelets from clumping together. Critical after heart attacks, strokes, and stent placement.",
        "conditions": ["Acute Coronary Syndrome", "Recent Heart Attack", "Recent Stroke", "Peripheral Arterial Disease", "Post-Stent"],
        "patient_type": "Patients who have had a recent heart attack, stroke, or stent placement. Those with peripheral arterial disease or acute coronary syndrome.",
        "icon": "shield"
    },
    "Levothyroxine": {
        "class": "Thyroid Hormone (Synthetic T4)",
        "description": "Synthetic replacement for thyroid hormone (thyroxine). Restores normal metabolic function in hypothyroid patients.",
        "conditions": ["Hypothyroidism", "Thyroid Goiter", "Thyroid Cancer (adjunct)", "Myxedema"],
        "patient_type": "Patients with underactive thyroid (hypothyroidism), enlarged thyroid gland (goiter), and as part of thyroid cancer treatment.",
        "icon": "thermometer"
    },
    "Salbutamol": {
        "class": "Short-Acting Beta-Agonist (SABA) / Bronchodilator",
        "description": "Rapidly relaxes airway muscles, opening the bronchial tubes for easier breathing. Used as a rescue inhaler.",
        "conditions": ["Asthma", "Exercise-Induced Bronchospasm", "COPD", "Acute Bronchospasm"],
        "patient_type": "Patients with asthma (for acute attacks and prevention), COPD, and exercise-induced breathing difficulties.",
        "icon": "wind"
    },
    "Omeprazole": {
        "class": "Proton Pump Inhibitor (PPI)",
        "description": "Reduces stomach acid production by blocking the proton pump in parietal cells. Heals and prevents acid-related damage.",
        "conditions": ["GERD", "Stomach Ulcers", "Duodenal Ulcers", "Erosive Esophagitis", "Zollinger-Ellison Syndrome", "H. pylori (combination)"],
        "patient_type": "Patients with gastroesophageal reflux disease (GERD), stomach/duodenal ulcers, and conditions causing excess stomach acid.",
        "icon": "pill"
    },
    "Orlistat": {
        "class": "Lipase Inhibitor (Anti-Obesity)",
        "description": "Blocks fat absorption in the intestines by inhibiting pancreatic and gastric lipases. Aids weight loss alongside diet and exercise.",
        "conditions": ["Obesity", "Weight Management", "BMI ≥ 30", "BMI ≥ 27 with comorbidities"],
        "patient_type": "Obese patients (BMI ≥ 30) or overweight patients (BMI ≥ 27) with weight-related conditions like diabetes, hypertension, or high cholesterol.",
        "icon": "scale"
    },
    "Paracetamol": {
        "class": "Analgesic / Antipyretic",
        "description": "Relieves mild to moderate pain and reduces fever. One of the most widely used over-the-counter medications worldwide.",
        "conditions": ["Headache", "Muscle Pain", "Arthritis (mild)", "Fever", "Cold & Flu Symptoms", "Toothache"],
        "patient_type": "General population for pain relief and fever reduction. Suitable for most age groups including children and elderly.",
        "icon": "thermometer"
    },
    "Amoxicillin": {
        "class": "Penicillin-class Antibiotic",
        "description": "Broad-spectrum antibiotic that kills bacteria by inhibiting cell wall synthesis. Effective against many common bacterial infections.",
        "conditions": ["Respiratory Infections", "Ear Infections", "Urinary Tract Infections", "Skin Infections", "H. pylori", "Dental Infections"],
        "patient_type": "Patients with bacterial infections of the respiratory tract, ears, urinary system, skin. All ages from infants to adults.",
        "icon": "shield"
    },
    "No Drug": {
        "class": "No Medication Required",
        "description": "The AI model determined that no pharmaceutical intervention is needed. Lifestyle modifications and monitoring may be recommended.",
        "conditions": ["Healthy Profile", "Low Risk", "Lifestyle Management"],
        "patient_type": "Healthy patients or those with low-risk profiles where lifestyle changes (diet, exercise, monitoring) are sufficient.",
        "icon": "check"
    }
}

@app.get("/")
def read_root():
    return {
        "status": "Genovix Medical Recommendation API is running",
        "model_accuracy": "84.70%",
        "total_drugs": len(DRUG_DATABASE),
        "total_patients": 300000,
        "genetic_markers": 21
    }

@app.get("/drugs")
def get_drugs():
    """Return the complete drug database with medical information."""
    return {
        "total": len(DRUG_DATABASE),
        "drugs": DRUG_DATABASE
    }

@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        # Start with the baseline median/mode values for all features
        data = baselines.copy()
        
        # Track how many features are user-provided (vs baseline)
        features_provided = 10  # The 10 core fields are always provided
        total_features = len(baselines)
        
        # Override baselines with the user-provided core inputs
        data['Age'] = request.Age
        data['Gender'] = request.Gender
        data['BMI'] = request.BMI
        data['eGFR'] = request.eGFR
        data['HbA1c'] = request.HbA1c
        data['TSH'] = request.TSH
        data['LDL_Cholesterol'] = request.LDL_Cholesterol
        
        data['Diabetes'] = request.Diabetes
        data['Hypertension'] = request.Hypertension
        data['Heart_Disease'] = request.Heart_Disease
        
        # Override baselines with advanced optional fields when provided
        advanced_fields = {
            'Blood_Pressure': request.Blood_Pressure,
            'Heart_Rate': request.Heart_Rate,
            'Cholesterol': request.Cholesterol,
            'Fasting_Glucose': request.Fasting_Glucose,
            'WBC': request.WBC,
            'ACR': request.ACR,
            'Smoking_Status': request.Smoking_Status,
            'Alcohol_Intake': request.Alcohol_Intake,
            'Asthma': request.Asthma,
            'Thyroid': request.Thyroid,
            'Infection': request.Infection,
            'GERD_Flag': request.GERD_Flag,
            'CAD_Flag': request.CAD_Flag,
            'Genetic_Risk_Score': request.Genetic_Risk_Score,
            'Genetic_Drug_Match_Score': request.Genetic_Drug_Match_Score,
            'Drug_Efficacy_Multiplier': request.Drug_Efficacy_Multiplier,
            'Statin_Response_Score': request.Statin_Response_Score,
            'Clopidogrel_Metabolism_Score': request.Clopidogrel_Metabolism_Score,
            'Hepatic_Metabolism_Rate': request.Hepatic_Metabolism_Rate,
            'CYP2C19_Metabolism': request.CYP2C19_Metabolism,
            'Anti_Inflammatory_Response': request.Anti_Inflammatory_Response,
            'Polygenic_Risk_Index': request.Polygenic_Risk_Index,
            'Genetic_Contraindication_Flag': request.Genetic_Contraindication_Flag,
        }
        
        for field_name, field_value in advanced_fields.items():
            if field_value is not None:
                data[field_name] = field_value
                features_provided += 1
        
        # Override any additional features passed via extra dict
        for k, v in request.extra.items():
            if k in data:
                data[k] = v

        # Compute derived features as the original notebook trained with them
        if 'Genetic_Drug_Match_Score' in data:
            data['Genetic_HbA1c_Int'] = data['Genetic_Drug_Match_Score'] * (data['HbA1c'] / 10)
            data['Genetic_eGFR_Int'] = data['Genetic_Drug_Match_Score'] * (data['eGFR'] / 100)
            
        if 'Drug_Efficacy_Multiplier' in data:
            data['DrugEff_BMI_Int'] = data['Drug_Efficacy_Multiplier'] * (data['BMI'] / 30)
            
        if 'Hepatic_Metabolism_Rate' in data:
            data['Metabolism_LDL_Int'] = data['Hepatic_Metabolism_Rate'] * (data['LDL_Cholesterol'] / 100)
            
        if all(k in data for k in ['Genetic_Drug_Match_Score', 'Drug_Efficacy_Multiplier', 'Statin_Response_Score', 'Clopidogrel_Metabolism_Score']):
            data['Pharma_Score_Combo'] = (
                data['Genetic_Drug_Match_Score'] * 0.4 +
                data['Drug_Efficacy_Multiplier'] * 0.3 +
                data['Statin_Response_Score'] * 0.15 +
                data['Clopidogrel_Metabolism_Score'] * 0.15
            )

        # Convert to DataFrame
        df = pd.DataFrame([data])
        
        # One-hot encode using the exact same logic
        df_encoded = pd.get_dummies(df, drop_first=True)
        
        # Ensure all expected columns are present, padding missed ones with 0
        for col in expected_features:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
                
        # Filter only expected features in the correct order
        X = df_encoded[expected_features]
        
        prediction = model.predict(X)[0]
        
        # Getting probabilities
        probabilities = model.predict_proba(X)[0]
        top_prob = float(max(probabilities))
        
        # Determine prediction quality tier
        if features_provided >= 30:
            quality = "Precision"
        elif features_provided >= 20:
            quality = "Enhanced"
        else:
            quality = "Basic"
        
        return {
            "prediction": str(prediction),
            "confidence": round(top_prob * 100, 2),
            "features_provided": features_provided,
            "features_total": total_features,
            "quality": quality,
            "status": "success"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
