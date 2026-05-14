import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def get_client():
    return OpenAI(
        api_key=os.getenv("KODEKLOUD_API_KEY"),
        base_url=os.getenv("KODEKLOUD_BASE_URL", 
                           "https://api.ai.kodekloud.com/v1")
    )

MODEL = os.getenv("KODEKLOUD_MODEL", "google/gemini-3.1-flash-lite")


def explain_recommendation(drug_name, patient_data, shap_features):
    try:
        client = get_client()

        # Build patient summary from filled fields only
        all_labels = {
            "age": "Age", "gender": "Gender", "bmi": "BMI",
            "egfr": "EGFR (Kidney Function)",
            "hba1c": "HBA1C (Blood Sugar)",
            "tsh": "TSH (Thyroid)",
            "ldl_cholesterol": "LDL Cholesterol",
            "diabetes": "Diabetes",
            "hypertension": "Hypertension",
            "heart_disease": "Heart Disease",
            "blood_pressure": "Blood Pressure (Systolic)",
            "heart_rate": "Heart Rate",
            "total_cholesterol": "Total Cholesterol",
            "fasting_glucose": "Fasting Glucose",
            "smoking_status": "Smoking Status",
            "alcohol_intake": "Alcohol Intake",
            "asthma": "Asthma",
            "thyroid": "Thyroid Condition",
            "infection": "Infection",
            "gerd": "GERD",
            "cad": "CAD"
        }

        filled = []
        for key, label in all_labels.items():
            val = patient_data.get(key)
            if val not in [None, "", "unknown"]:
                filled.append(f"- {label}: {val}")
        patient_summary = "\n".join(filled)

        # Special case: No Medication Required
        if drug_name == "No Medication Required":
            prompt = f"""You are a clinical AI assistant.
A patient's analysis shows NO medication is required.

Patient values:
{patient_summary}

In 2-3 sentences, explain why no medication is needed.
Mention specific normal values. Be reassuring and precise.
Do NOT mention disease names unless patient has them."""

        else:
            # Build SHAP text safely
            try:
                if shap_features and isinstance(shap_features, list):
                    if isinstance(shap_features[0], dict):
                        shap_text = ", ".join([
                            f"{f.get('feature','?')} ({float(f.get('importance',0)):.4f})"
                            for f in shap_features[:5]
                        ])
                    else:
                        shap_text = str(shap_features[:5])
                else:
                    shap_text = "not available"
            except:
                shap_text = "not available"

            prompt = f"""You are a clinical AI assistant.
A Random Forest ML model recommended {drug_name} for this patient.

Patient clinical values:
{patient_summary}

Top model features by importance: {shap_text}

In 3-4 sentences, explain specifically WHY {drug_name} was 
recommended for THIS patient based on THEIR specific values.
- Mention actual numbers from the patient values
- Explain the clinical reasoning clearly
- Be precise and professional
- Do NOT say please consult or please try again
- Do NOT give generic responses"""

        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"AI explanation error: {str(e)}"


def answer_medical_question(question, drug_name, 
                             patient_data, chat_history=[]):
    try:
        client = get_client()

        # Build patient context
        all_labels = {
            "age": "Age", "gender": "Gender", "bmi": "BMI",
            "egfr": "EGFR (Kidney Function)",
            "hba1c": "HBA1C (Blood Sugar)",
            "tsh": "TSH (Thyroid)",
            "ldl_cholesterol": "LDL Cholesterol",
            "diabetes": "Diabetes",
            "hypertension": "Hypertension",
            "heart_disease": "Heart Disease",
            "blood_pressure": "Blood Pressure",
            "total_cholesterol": "Total Cholesterol",
            "asthma": "Asthma",
            "thyroid": "Thyroid Condition",
            "gerd": "GERD",
            "cad": "CAD",
            "smoking_status": "Smoking",
            "alcohol_intake": "Alcohol"
        }
        filled = []
        for key, label in all_labels.items():
            val = patient_data.get(key)
            if val not in [None, "", "unknown"]:
                filled.append(f"- {label}: {val}")
        patient_context = "\n".join(filled) if filled else "No data"

        # Build messages array with history
        messages = [
            {
                "role": "system",
                "content": f"""You are an expert clinical AI assistant 
helping a doctor understand a drug recommendation.

Patient Profile:
{patient_context}

Recommended Drug: {drug_name}

Answer questions thoroughly and clinically.
Explain drug mechanism, dosage, side effects, 
contraindications, alternatives when asked.
Always be precise and evidence-based."""
            }
        ]

        # Add chat history (last 6 messages)
        for msg in chat_history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})

        # Add current question
        messages.append({"role": "user", "content": question})

        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=400
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Chat error: {str(e)}"


def generate_rag_answer(query, context_docs):
    try:
        client = get_client()
        context = "\n\n".join(context_docs) if context_docs else ""
        prompt = f"""You are a medical knowledge assistant.
Use the following drug information to answer the query.

Context:
{context}

Query: {query}

Give a clear, accurate answer based on the context above."""

        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"RAG error: {str(e)}"

DISCLAIMER = "This is AI-generated information, not medical advice. Please consult a qualified healthcare professional before making any medical decisions."