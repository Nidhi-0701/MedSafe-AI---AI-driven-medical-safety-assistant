"""
Symptom & Doubt Solver API.

POST /api/symptom-check – accepts symptoms text, returns structured guidance from Gemini.
"""

from flask import Blueprint, request, jsonify

from services.gemini_service import generate_symptom_guidance
from database.db import db
from database.models import SymptomCheckLog

symptom_bp = Blueprint("symptom", __name__)


@symptom_bp.route("/symptom-check", methods=["POST"])
def symptom_check():
    """
    Accept JSON: { "symptoms": "headache and dizziness" }.
    Returns possible causes, remedies, lifestyle suggestions, and warning signs (from Gemini).
    """
    data = request.get_json() or {}
    symptoms = (data.get("symptoms") or "").strip()
    if not symptoms:
        return jsonify({"error": "Missing or empty 'symptoms' field"}), 400

    result = generate_symptom_guidance(symptoms)
    if result is None:
        return jsonify({
            "error": "AI service unavailable. Please set GEMINI_API_KEY.",
            "symptoms": symptoms,
        }), 503

    # Optional: log for dashboard insights
    try:
        log = SymptomCheckLog(symptoms=symptoms)
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({
        "symptoms": symptoms,
        "possible_causes": result.get("possible_causes", []),
        "simple_remedies": result.get("simple_remedies", []),
        "lifestyle_suggestions": result.get("lifestyle_suggestions", []),
        "warning_signs": result.get("warning_signs", []),
    })
