"""
Healthcare AI Chatbot with Retrieval-Augmented Generation (RAG)
- Vector indexing of MedQuAD Q&A and Clinical Knowledge Base
- TF-IDF & Cosine Similarity Semantic Retrieval
- Medical Terminology Simplifier
- Clinical Triage Emergency Guardrails
- Context-Aware Conversational Response Generation
"""

import os
import json
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "ml", "datasets")

# Load Knowledge Base
MEDQUAD_PATH = os.path.join(DATASET_DIR, "medquad_qa.json")
CATALOG_PATH = os.path.join(DATASET_DIR, "disease_catalog.json")

# Terminology dictionary for automated simplification
MEDICAL_TERMS_GLOSSARY = {
    "myocardial infarction": "heart attack, caused by blocked blood flow to the heart muscle",
    "dyspnea": "shortness of breath or difficulty breathing",
    "tachypnea": "abnormally rapid breathing rate",
    "tachycardia": "fast resting heart rate (typically over 100 beats per minute)",
    "bradycardia": "slow resting heart rate (typically below 60 beats per minute)",
    "hypertension": "high blood pressure (above 130/80 mmHg)",
    "hypotension": "abnormally low blood pressure",
    "hyperglycemia": "high blood sugar levels",
    "hypoglycemia": "low blood sugar levels (typically under 70 mg/dL)",
    "polyuria": "excessive or unusually frequent urination",
    "polydipsia": "excessive, unquenchable thirst",
    "diaphoresis": "heavy, excessive perspiration or cold sweat",
    "anosmia": "loss of the sense of smell",
    "ageusia": "loss of the sense of taste",
    "neuropathy": "nerve damage often causing numbness, tingling, or weakness",
    "edema": "swelling caused by excess fluid trapped in bodily tissues",
    "thrombus": "a blood clot formed within a blood vessel",
    "ischemia": "inadequate blood and oxygen supply to an organ or tissue",
    "pyrosis": "heartburn or burning sensation in the esophagus",
    "angina": "chest pain or tightness caused by reduced blood flow to heart muscle",
    "nephropathy": "kidney disease or damage to the renal filtering system"
}

# Acute emergency trigger patterns
EMERGENCY_TRIGGERS = [
    r"chest pain", r"heart attack", r"can't breathe", r"cannot breathe",
    r"difficulty breathing", r"severe shortness of breath", r"slurred speech",
    r"face drooping", r"arm weakness", r"stroke", r"thunderclap headache",
    r"coughing up blood", r"passed out", r"unconscious", r"suicid",
    r"severe allergic reaction", r"throat closing", r"anaphylaxis"
]

class HealthcareRAGService:
    def __init__(self):
        self.documents = []
        self.vectorizer = None
        self.doc_vectors = None
        self.load_and_index_knowledge_base()

    def load_and_index_knowledge_base(self):
        """Loads and indexes MedQuAD QA and disease catalog documents."""
        raw_docs = []
        
        # 1. MedQuAD QA pairs
        if os.path.exists(MEDQUAD_PATH):
            try:
                with open(MEDQUAD_PATH, "r", encoding="utf-8") as f:
                    qa_items = json.load(f)
                    for item in qa_items:
                        raw_docs.append({
                            "id": item.get("id"),
                            "title": item.get("question"),
                            "text": f"{item.get('question')} {item.get('answer')}",
                            "content": item.get("answer"),
                            "category": item.get("category", "General"),
                            "source": item.get("source", "MedQuAD / NIH"),
                            "urgency": item.get("urgency", "Routine")
                        })
            except Exception as e:
                print(f"Error loading MedQuAD: {e}")

        # 2. Disease Catalog
        if os.path.exists(CATALOG_PATH):
            try:
                with open(CATALOG_PATH, "r", encoding="utf-8") as f:
                    disease_items = json.load(f)
                    for d in disease_items:
                        text = f"{d.get('name')} {d.get('description')} symptoms: {', '.join(d.get('symptoms', []))} treatments: {', '.join(d.get('treatments', []))}"
                        raw_docs.append({
                            "id": d.get("icd10", "DIS"),
                            "title": f"Clinical Guide: {d.get('name')}",
                            "text": text,
                            "content": f"{d.get('description')} Common symptoms: {', '.join(d.get('symptoms', []))}. Treatments include: {', '.join(d.get('treatments', []))}. Prevention: {', '.join(d.get('prevention', []))}.",
                            "category": d.get("category", "Internal Medicine"),
                            "source": d.get("reference", "Medical Clinical Reference Guidelines"),
                            "urgency": "Emergency" if d.get("severity") == "Emergency" else "Routine"
                        })
            except Exception as e:
                print(f"Error loading Disease Catalog: {e}")

        self.documents = raw_docs
        
        # Build TF-IDF vector index
        if self.documents:
            corpus = [doc["text"] for doc in self.documents]
            self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
            self.doc_vectors = self.vectorizer.fit_transform(corpus)
            print(f"Indexed {len(self.documents)} medical knowledge passages for RAG.")

    def search_knowledge(self, query: str, top_k: int = 3) -> list[dict]:
        """Perform semantic search using TF-IDF cosine similarity."""
        if not self.vectorizer or not self.documents:
            return []
            
        q_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(q_vec, self.doc_vectors)[0]
        top_indices = np.argsort(scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score > 0.05: # Minimum relevance threshold
                doc = dict(self.documents[idx])
                doc["relevance_score"] = round(score * 100, 1)
                results.append(doc)
                
        return results

    def extract_simplified_terms(self, text: str) -> dict[str, str]:
        """Find complex medical terms in text and return plain-English definitions."""
        found = {}
        clean_text = text.lower()
        for term, explanation in MEDICAL_TERMS_GLOSSARY.items():
            if re.search(r"\b" + re.escape(term) + r"\b", clean_text):
                found[term.title()] = explanation
        return found

    def check_emergency(self, query: str) -> bool:
        """Detect acute medical emergencies."""
        q_lower = query.lower()
        for pattern in EMERGENCY_TRIGGERS:
            if re.search(r"\b" + pattern + r"\b", q_lower):
                return True
        return False

    def generate_response(
        self,
        query: str,
        chat_history: list[dict] = None
    ) -> dict:
        """
        Synthesizes a clinically grounded, compassionate, and educational response.
        Applies RAG retrieval, terminology simplification, emergency checks, and disclaimers.
        """
        is_emergency = self.check_emergency(query)
        retrieved_docs = self.search_knowledge(query, top_k=3)
        
        # Build grounding context from retrieved medical sources
        context_snippets = []
        sources = []
        for doc in retrieved_docs:
            context_snippets.append(doc["content"])
            sources.append({
                "title": doc["title"],
                "category": doc["category"],
                "source": doc["source"],
                "relevance": doc["relevance_score"]
            })
            
        # Clinical response construction
        response_parts = []
        
        # 1. Emergency Banner if triggered
        if is_emergency:
            response_parts.append(
                "🚨 **URGENT MEDICAL ALERT**: Your question describes symptoms that could require immediate emergency intervention. "
                "If you or someone nearby is experiencing acute chest pain, sudden facial drooping or weakness, difficulty breathing, "
                "or severe allergic reactions, please **call 911 (or local emergency dispatch)** or go to the nearest Emergency Room immediately. "
                "Do not wait for an online response."
            )

        # 2. Core Educational Answer
        if retrieved_docs:
            top_doc = retrieved_docs[0]
            response_parts.append(f"### Medical Understanding & Guidance\n\n{top_doc['content']}")
            
            # If multiple relevant docs found, add complementary points
            if len(retrieved_docs) > 1 and retrieved_docs[1]["relevance_score"] > 25:
                response_parts.append(f"\n**Additional Clinical Context:**\n{retrieved_docs[1]['content']}")
        else:
            # Fallback general guidance for free-form queries
            response_parts.append(
                f"### Healthcare Assistant Overview\n\n"
                f"Regarding your query on '{query}': In clinical practice, evaluating this requires reviewing the onset, "
                f"severity, duration, and associated symptoms. Maintaining open communication with your primary care physician "
                f"or relevant medical specialist is the most reliable way to receive tailored diagnostics, lab tests, or therapeutic interventions."
            )

        # 3. Actionable Patient Steps & Self-Care Checklist
        response_parts.append(
            "\n### Recommended Next Steps for Patients:\n"
            "- **Document Vitals & Timeline:** Keep a daily log of symptom occurrence, triggers, blood pressure, or temperature.\n"
            "- **Schedule Medical Review:** Contact your primary care physician for comprehensive clinical evaluation.\n"
            "- **Red-Flag Awareness:** Seek immediate urgent care if you experience sudden worsening, high fever, shortness of breath, or intense pain."
        )

        full_content = "\n\n".join(response_parts)
        
        # Extract medical terms for tooltip simplification
        simplified_terms = self.extract_simplified_terms(full_content + " " + query)
        
        # Mandatory Clinical Disclaimer
        disclaimer = (
            "Disclaimer: This AI Healthcare Assistant provides general medical knowledge for educational purposes only. "
            "It does NOT offer medical diagnosis, prescribe drugs, or substitute for professional medical judgment. "
            "Always consult a qualified healthcare provider for clinical decisions."
        )

        return {
            "content": full_content,
            "sources": sources,
            "simplified_terms": simplified_terms,
            "is_emergency": is_emergency,
            "disclaimer": disclaimer
        }

# Singleton RAG instance
rag_service = HealthcareRAGService()
