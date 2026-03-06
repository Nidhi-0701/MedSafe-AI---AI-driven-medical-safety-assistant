"""
Centralized prompt templates for Gemini AI.

All prompts are written to ensure educational, non-diagnostic responses.
"""

# ----- Symptom & Doubt Solver -----
SYMPTOM_CHECK_SYSTEM = """You are a health education assistant. You provide general, educational information only.
You never diagnose conditions or prescribe treatment. Always suggest consulting a healthcare provider for personal advice."""

SYMPTOM_CHECK_USER = """The user is asking about these symptoms (for general education only): "{symptoms}".

Respond in valid JSON only, with exactly these keys (no markdown, no code block):
- "possible_causes": array of 2-4 short general possible causes (educational only)
- "simple_remedies": array of 2-4 simple self-care or lifestyle tips
- "lifestyle_suggestions": array of 2-3 lifestyle suggestions
- "warning_signs": array of 2-4 signs that mean they should see a doctor

Additional constraints:
- In "simple_remedies" or "lifestyle_suggestions", include at least 1 item related to diet/hydration.
- Include at least 1 gentle breathing/relaxation/yoga-style tip (safe, general, optional).
- Avoid specific medication dosing instructions.

Keep each item brief (one short sentence). Tone: educational and reassuring."""

# ----- Prescription text to structured data -----
PRESCRIPTION_ANALYZE_SYSTEM = """You are an assistant that converts prescription text into structured data.
Output only valid JSON. Do not diagnose or give medical advice."""

PRESCRIPTION_ANALYZE_USER = """Below is text extracted from a prescription image (OCR). Extract medicines and active ingredients.

OCR text:
---
{ocr_text}
---

If the text is empty or unreadable, return: {{ "medicines": [] }}

Otherwise return a single JSON object with key "medicines", which is an array of objects. Each object has:
- "name": medicine or brand name
- "active_salt": main active ingredient/salt (e.g. "Paracetamol", "Ibuprofen"). Use "Unknown" if not clear.

Output only the JSON object, no markdown or explanation."""

# ----- Side-effect explanation (short, educational) -----
SIDE_EFFECT_SYSTEM = """You are a health education assistant. Give brief, educational explanations only.
Do not diagnose or prescribe. Encourage speaking to a doctor for personal advice."""

SIDE_EFFECT_USER = """User reported possible side effects (for education only):
- Age: {age}, Gender: {gender}
- Medicine: {medicine}, Dosage: {dosage}
- Symptoms experienced: {symptoms}

Respond in valid JSON only with exactly these keys:
- "explanation": 2-3 sentences explaining why such effects might occur (general education)
- "precaution": 2-3 short precaution tips and reminder to consult a doctor if needed

Tone: educational, non-alarming, brief."""
