"""
rag_service.py — RAG (Retrieval-Augmented Generation) Service
=============================================================
Uses ChromaDB as an in-memory vector database to store and retrieve
medical knowledge about the 15 drugs in the Genovix system.
Provides context-aware document retrieval for AI-powered Q&A.
"""

import chromadb
from chromadb.config import Settings

# Global ChromaDB client and collection reference
_chroma_client = None
_drug_collection = None

# ──────────────────────────────────────────────────────────────
# Drug Knowledge Base — One detailed paragraph per drug
# covering: what it treats, mechanism of action, common side effects
# ──────────────────────────────────────────────────────────────
DRUG_KNOWLEDGE_BASE = [
    {
        "id": "metformin",
        "text": (
            "Metformin is a biguanide-class oral antidiabetic medication and the first-line treatment for Type 2 Diabetes Mellitus. "
            "It works by reducing hepatic (liver) glucose production, decreasing intestinal absorption of glucose, and improving insulin sensitivity "
            "by increasing peripheral glucose uptake and utilization. Metformin does not cause hypoglycemia when used alone. "
            "Common side effects include gastrointestinal issues such as nausea, diarrhea, abdominal pain, and metallic taste. "
            "A rare but serious side effect is lactic acidosis, especially in patients with kidney impairment (low eGFR). "
            "It is typically prescribed for patients with HbA1c above 6.5% and is often combined with lifestyle modifications."
        ),
        "drug": "Metformin"
    },
    {
        "id": "insulin",
        "text": (
            "Insulin is a peptide hormone therapy essential for managing blood sugar levels in diabetic patients. "
            "It is always required for Type 1 Diabetes and used in Type 2 Diabetes when oral medications fail to achieve glycemic control. "
            "Insulin works by facilitating cellular glucose uptake, promoting glycogen synthesis, and inhibiting gluconeogenesis. "
            "There are several types: rapid-acting (lispro, aspart), short-acting (regular), intermediate (NPH), and long-acting (glargine, detemir). "
            "Common side effects include hypoglycemia (low blood sugar), weight gain, injection site reactions, and lipodystrophy. "
            "Patients on insulin require regular blood glucose monitoring and dose adjustments based on HbA1c levels and fasting glucose readings."
        ),
        "drug": "Insulin"
    },
    {
        "id": "amlodipine",
        "text": (
            "Amlodipine is a calcium channel blocker (CCB) used primarily to treat hypertension (high blood pressure) and angina (chest pain). "
            "It works by relaxing vascular smooth muscle, causing vasodilation which reduces peripheral vascular resistance and lowers blood pressure. "
            "Amlodipine has a long half-life (~30-50 hours) allowing once-daily dosing, making it convenient for patients. "
            "It is particularly effective in elderly patients and those with isolated systolic hypertension. "
            "Common side effects include peripheral edema (ankle swelling), dizziness, flushing, headache, and fatigue. "
            "It is often used in combination with ACE inhibitors or ARBs for better blood pressure control."
        ),
        "drug": "Amlodipine"
    },
    {
        "id": "losartan",
        "text": (
            "Losartan is an angiotensin II receptor blocker (ARB) used to treat hypertension and protect the kidneys in diabetic patients. "
            "It works by blocking the angiotensin II type 1 (AT1) receptor, preventing vasoconstriction and aldosterone secretion. "
            "This results in blood vessel relaxation and reduced blood pressure. Losartan is particularly beneficial for patients with "
            "diabetic nephropathy (kidney disease) as it reduces proteinuria and slows progression of renal damage. "
            "Common side effects include dizziness, hyperkalemia (high potassium), fatigue, and back pain. "
            "Unlike ACE inhibitors, Losartan rarely causes dry cough, making it a preferred alternative for cough-sensitive patients."
        ),
        "drug": "Losartan"
    },
    {
        "id": "atorvastatin",
        "text": (
            "Atorvastatin is a statin medication (HMG-CoA reductase inhibitor) used to lower LDL ('bad') cholesterol and triglycerides. "
            "It works by blocking the enzyme HMG-CoA reductase in the liver, which is essential for cholesterol production. "
            "This causes the liver to absorb more LDL from the blood, significantly reducing cardiovascular risk. "
            "Atorvastatin is prescribed for hyperlipidemia, prevention of heart attacks, and in patients with coronary artery disease. "
            "Common side effects include muscle pain (myalgia), joint pain, digestive issues, and rarely rhabdomyolysis (severe muscle breakdown). "
            "Liver function should be monitored periodically. Genetic factors like statin response score influence its efficacy."
        ),
        "drug": "Atorvastatin"
    },
    {
        "id": "rosuvastatin",
        "text": (
            "Rosuvastatin is a potent statin used for aggressive lowering of LDL cholesterol and cardiovascular risk reduction. "
            "It is one of the most effective statins, capable of reducing LDL by up to 55% at maximum doses. "
            "Rosuvastatin works by inhibiting HMG-CoA reductase and has a longer half-life than most statins. "
            "It also slows atherosclerosis progression and slightly raises HDL ('good') cholesterol levels. "
            "Common side effects include headache, muscle aches, abdominal pain, nausea, and weakness. "
            "Patients with high genetic statin response scores tend to respond more favorably. "
            "Regular monitoring of lipid panels and liver enzymes is recommended during treatment."
        ),
        "drug": "Rosuvastatin"
    },
    {
        "id": "aspirin",
        "text": (
            "Aspirin (acetylsalicylic acid) serves dual roles: at low doses (75-100mg) it prevents blood clots as an antiplatelet agent, "
            "and at higher doses (300-600mg) it provides pain relief and reduces fever as an NSAID. "
            "Low-dose aspirin is widely used for secondary prevention of heart attacks and strokes in cardiovascular patients. "
            "It works by irreversibly inhibiting cyclooxygenase (COX) enzymes, blocking thromboxane A2 production in platelets. "
            "Common side effects include gastrointestinal bleeding, stomach ulcers, bruising, and tinnitus (at high doses). "
            "It should be used with caution in patients with bleeding disorders, asthma, or those on anticoagulant therapy."
        ),
        "drug": "Aspirin"
    },
    {
        "id": "clopidogrel",
        "text": (
            "Clopidogrel is a P2Y12 platelet inhibitor used to prevent blood clots after heart attacks, strokes, and stent placement. "
            "It works by irreversibly blocking the P2Y12 receptor on platelets, inhibiting ADP-induced platelet aggregation. "
            "Clopidogrel is a prodrug that requires hepatic activation by CYP2C19 enzymes — patients with poor CYP2C19 metabolism "
            "may have reduced drug effectiveness, making pharmacogenomic testing (CYP2C19 metabolism score) clinically important. "
            "Common side effects include bleeding, bruising, rash, diarrhea, and abdominal pain. "
            "It is often prescribed in combination with aspirin (dual antiplatelet therapy) after acute coronary syndrome."
        ),
        "drug": "Clopidogrel"
    },
    {
        "id": "levothyroxine",
        "text": (
            "Levothyroxine is a synthetic thyroid hormone (T4) used to treat hypothyroidism (underactive thyroid). "
            "It replaces the thyroxine that the thyroid gland cannot produce in sufficient quantities. "
            "The body converts levothyroxine (T4) to the active form triiodothyronine (T3) which regulates metabolism, energy, and growth. "
            "Dosing is individualized based on TSH levels — elevated TSH indicates the need for higher doses. "
            "Common side effects (usually from over-replacement) include rapid heartbeat, tremors, weight loss, insomnia, and heat sensitivity. "
            "It should be taken on an empty stomach, 30-60 minutes before breakfast, and away from calcium or iron supplements."
        ),
        "drug": "Levothyroxine"
    },
    {
        "id": "salbutamol",
        "text": (
            "Salbutamol (albuterol) is a short-acting beta-2 agonist (SABA) bronchodilator used as a rescue inhaler for asthma and COPD. "
            "It works by stimulating beta-2 adrenergic receptors in the airway smooth muscle, causing rapid bronchodilation within 5-15 minutes. "
            "Relief typically lasts 4-6 hours. It is the first-line treatment for acute asthma attacks and exercise-induced bronchospasm. "
            "Common side effects include tremor, palpitations, headache, muscle cramps, and mild tachycardia. "
            "Frequent use (more than 2-3 times per week) may indicate poorly controlled asthma requiring a step-up in controller therapy. "
            "It is available as a metered-dose inhaler (MDI), nebulizer solution, or oral formulation."
        ),
        "drug": "Salbutamol"
    },
    {
        "id": "omeprazole",
        "text": (
            "Omeprazole is a proton pump inhibitor (PPI) that reduces stomach acid production by irreversibly blocking the H+/K+ ATPase enzyme "
            "in gastric parietal cells. It is used to treat GERD (gastroesophageal reflux disease), stomach ulcers, duodenal ulcers, "
            "and conditions like Zollinger-Ellison syndrome that cause excess acid production. "
            "It is also used in combination with antibiotics for H. pylori eradication. "
            "Common side effects include headache, nausea, diarrhea, abdominal pain, and flatulence. "
            "Long-term use may be associated with vitamin B12 deficiency, magnesium depletion, increased fracture risk, and Clostridium difficile infection. "
            "Patients with GERD flags are commonly prescribed this medication."
        ),
        "drug": "Omeprazole"
    },
    {
        "id": "orlistat",
        "text": (
            "Orlistat is a lipase inhibitor used for weight management in obese patients (BMI ≥ 30) or overweight patients (BMI ≥ 27) with comorbidities. "
            "It works by blocking pancreatic and gastric lipases in the gut, preventing the absorption of approximately 30% of dietary fat. "
            "The unabsorbed fat is excreted, resulting in reduced caloric intake and gradual weight loss. "
            "Common side effects include oily/fatty stools, flatulence with discharge, fecal urgency, and fat-soluble vitamin deficiency (A, D, E, K). "
            "Patients are advised to follow a low-fat diet to minimize gastrointestinal side effects. "
            "Orlistat is most effective when combined with a calorie-restricted diet and regular exercise program."
        ),
        "drug": "Orlistat"
    },
    {
        "id": "paracetamol",
        "text": (
            "Paracetamol (acetaminophen) is one of the most widely used analgesic and antipyretic medications worldwide. "
            "It relieves mild to moderate pain (headaches, muscle aches, toothaches) and reduces fever. "
            "Its exact mechanism is not fully understood, but it is believed to inhibit COX enzymes centrally in the brain "
            "and may involve the endocannabinoid system. Unlike NSAIDs, it has minimal anti-inflammatory activity. "
            "Paracetamol is generally safe at recommended doses (max 4g/day for adults) but overdose can cause severe hepatotoxicity "
            "(liver damage) which can be fatal. Common side effects at normal doses are rare but may include nausea and allergic reactions. "
            "It is suitable for patients who cannot take NSAIDs due to stomach ulcers or bleeding risks."
        ),
        "drug": "Paracetamol"
    },
    {
        "id": "amoxicillin",
        "text": (
            "Amoxicillin is a broad-spectrum penicillin-class antibiotic effective against many Gram-positive and some Gram-negative bacteria. "
            "It works by inhibiting bacterial cell wall synthesis, specifically by binding to penicillin-binding proteins (PBPs). "
            "Amoxicillin is commonly prescribed for respiratory tract infections, ear infections (otitis media), urinary tract infections, "
            "skin infections, dental infections, and as part of H. pylori triple therapy. "
            "Common side effects include diarrhea, nausea, skin rash, and vomiting. Allergic reactions including anaphylaxis can occur "
            "in penicillin-sensitive patients. It is indicated for patients with elevated WBC counts suggesting active bacterial infection. "
            "Amoxicillin has excellent oral bioavailability and can be taken with or without food."
        ),
        "drug": "Amoxicillin"
    },
    {
        "id": "no_drug",
        "text": (
            "When the AI model recommends 'No Drug,' it indicates that the patient's health profile does not require pharmaceutical intervention. "
            "This typically applies to patients with normal lab values (HbA1c below 5.7%, normal blood pressure, healthy cholesterol levels), "
            "no significant medical conditions, and low genetic risk scores. The recommendation emphasizes lifestyle management: "
            "maintaining a balanced diet, regular physical activity (150+ minutes/week of moderate exercise), adequate sleep, stress management, "
            "and routine health check-ups. Patients in this category should continue monitoring their health indicators periodically "
            "and consult a physician if new symptoms develop or risk factors change over time."
        ),
        "drug": "No Drug"
    },
]


def setup_rag_collection():
    """
    Initialize ChromaDB in-memory and load the drug knowledge base.
    Called once during application startup.

    Returns:
        The ChromaDB collection object
    """
    global _chroma_client, _drug_collection

    try:
        # Create an in-memory ChromaDB client (suitable for minor project / deployment)
        _chroma_client = chromadb.Client(Settings(
            anonymized_telemetry=False
        ))

        # Create or get the drug knowledge collection
        _drug_collection = _chroma_client.get_or_create_collection(
            name="drug_knowledge_base",
            metadata={"description": "Medical knowledge about 15 drugs in the Genovix system"}
        )

        # Load knowledge base documents into ChromaDB
        _drug_collection.add(
            ids=[doc["id"] for doc in DRUG_KNOWLEDGE_BASE],
            documents=[doc["text"] for doc in DRUG_KNOWLEDGE_BASE],
            metadatas=[{"drug": doc["drug"]} for doc in DRUG_KNOWLEDGE_BASE],
        )

        print(f"✅ RAG Knowledge Base loaded: {len(DRUG_KNOWLEDGE_BASE)} drug documents indexed in ChromaDB.")
        return _drug_collection

    except Exception as e:
        print(f"❌ Error initializing RAG collection: {e}")
        return None


def retrieve_relevant_docs(query: str, top_k: int = 3) -> list:
    """
    Retrieve the most relevant medical text chunks from ChromaDB for a given query.

    Args:
        query: The user's search query or question
        top_k: Number of top results to return (default: 3)

    Returns:
        List of relevant text chunks (strings)
    """
    global _drug_collection

    if _drug_collection is None:
        print("⚠️  RAG collection not initialized. Attempting setup...")
        setup_rag_collection()

    if _drug_collection is None:
        return ["Knowledge base is currently unavailable. Please try again later."]

    try:
        results = _drug_collection.query(
            query_texts=[query],
            n_results=min(top_k, len(DRUG_KNOWLEDGE_BASE)),
        )

        # Extract the document texts from the results
        documents = results.get("documents", [[]])[0]
        return documents if documents else ["No relevant information found in the knowledge base."]

    except Exception as e:
        print(f"❌ Error retrieving documents from ChromaDB: {e}")
        return ["An error occurred while searching the knowledge base."]


def get_source_drugs(query: str, top_k: int = 3) -> list:
    """
    Get the drug names associated with the retrieved documents (for source attribution).

    Args:
        query: The user's search query
        top_k: Number of top results to return

    Returns:
        List of drug names that were used as sources
    """
    global _drug_collection

    if _drug_collection is None:
        return []

    try:
        results = _drug_collection.query(
            query_texts=[query],
            n_results=min(top_k, len(DRUG_KNOWLEDGE_BASE)),
        )

        metadatas = results.get("metadatas", [[]])[0]
        return [m.get("drug", "Unknown") for m in metadatas]

    except Exception as e:
        print(f"❌ Error getting source drugs: {e}")
        return []
