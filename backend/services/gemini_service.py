"""
Reusable Google Gemini API service for generating structured health guidance.

All responses are designed to be educational and non-diagnostic.
"""

import os
import json
import re
from typing import Optional

# Lazy import so app runs even without API key (endpoints can return friendly errors)
_gemini_model = None


def _get_model():
    """Get or create the Gemini model instance."""
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        return _gemini_model
    except Exception:
        return None


def generate_structured_response(system_instruction: str, user_prompt: str) -> Optional[dict]:
    """
    Call Gemini with system + user prompt and parse response as JSON.

    Returns None if API key is missing or request fails.
    """
    model = _get_model()
    if not model:
        return None
    try:
        response = model.generate_content(
            f"{system_instruction}\n\n{user_prompt}",
            generation_config={"temperature": 0.3},
        )
        if not response or not response.text:
            return None
        text = response.text.strip()
        # Remove markdown code block if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```\s*$", "", text)
        return json.loads(text)
    except Exception:
        return None


def generate_symptom_guidance(symptoms: str) -> Optional[dict]:
    """Generate structured symptom guidance (causes, remedies, lifestyle, warning signs)."""
    from utils.prompts import SYMPTOM_CHECK_SYSTEM, SYMPTOM_CHECK_USER
    return generate_structured_response(
        SYMPTOM_CHECK_SYSTEM,
        SYMPTOM_CHECK_USER.format(symptoms=symptoms),
    )


def generate_prescription_structure(ocr_text: str) -> Optional[dict]:
    """Convert OCR prescription text to structured { medicines: [{ name, active_salt }] }."""
    from utils.prompts import PRESCRIPTION_ANALYZE_SYSTEM, PRESCRIPTION_ANALYZE_USER
    return generate_structured_response(
        PRESCRIPTION_ANALYZE_SYSTEM,
        PRESCRIPTION_ANALYZE_USER.format(ocr_text=ocr_text or ""),
    )


def generate_side_effect_guidance(age: str, gender: str, medicine: str, dosage: str, symptoms: str) -> Optional[dict]:
    """Generate short explanation and precaution for a side-effect report."""
    from utils.prompts import SIDE_EFFECT_SYSTEM, SIDE_EFFECT_USER
    return generate_structured_response(
        SIDE_EFFECT_SYSTEM,
        SIDE_EFFECT_USER.format(
            age=age or "—",
            gender=gender or "—",
            medicine=medicine,
            dosage=dosage or "—",
            symptoms=symptoms,
        ),
    )
