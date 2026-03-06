"""
Side-Effect Monitor API.

POST /api/side-effect – store age, gender, medicine, dosage, symptoms; get AI explanation and precaution; save to DB.
"""

from flask import Blueprint, request, jsonify

from services.gemini_service import generate_side_effect_guidance
from database.db import db
from database.models import SideEffectReport

side_effect_bp = Blueprint("side_effect", __name__)


@side_effect_bp.route("/side-effect", methods=["POST"])
def side_effect_report():
    """
    Accept JSON: age, gender, medicine, dosage, symptoms.
    Store in DB and return AI-generated explanation and precaution.
    """
    data = request.get_json() or {}
    age = data.get("age")
    if age is not None:
        try:
            age = int(age)
        except (TypeError, ValueError):
            age = None
    gender = (data.get("gender") or "").strip() or None
    medicine = (data.get("medicine") or "").strip()
    dosage = (data.get("dosage") or "").strip() or None
    symptoms = (data.get("symptoms") or "").strip()
    if not medicine or not symptoms:
        return jsonify({"error": "Missing required fields: 'medicine' and 'symptoms'"}), 400

    ai_result = generate_side_effect_guidance(
        age=str(age) if age is not None else "",
        gender=gender or "",
        medicine=medicine,
        dosage=dosage or "",
        symptoms=symptoms,
    )
    explanation = None
    precaution = None
    if ai_result:
        explanation = ai_result.get("explanation")
        precaution = ai_result.get("precaution")

    # Save to database
    try:
        report = SideEffectReport(
            age=age,
            gender=gender,
            medicine=medicine,
            dosage=dosage,
            symptoms=symptoms,
            explanation=explanation,
            precaution=precaution,
        )
        db.session.add(report)
        db.session.commit()
        report_id = report.id
    except Exception:
        db.session.rollback()
        report_id = None

    return jsonify({
        "id": report_id,
        "medicine": medicine,
        "dosage": dosage,
        "symptoms": symptoms,
        "explanation": explanation or "AI explanation unavailable. Please consult a healthcare provider.",
        "precaution": precaution or "When in doubt, consult your doctor or pharmacist.",
    })


@side_effect_bp.route("/side-effect-logs", methods=["GET"])
def get_side_effect_logs():
    """Return recent side-effect reports for the dashboard / monitor page."""
    limit = min(int(request.args.get("limit", 50)), 100)
    reports = (
        SideEffectReport.query
        .order_by(SideEffectReport.created_at.desc())
        .limit(limit)
        .all()
    )
    return jsonify({
        "logs": [
            {
                "id": r.id,
                "medicine": r.medicine,
                "dosage": r.dosage or "",
                "age": r.age,
                "gender": r.gender or "",
                "symptoms": r.symptoms,
                "explanation": r.explanation,
                "precaution": r.precaution,
                "date": r.created_at.isoformat() if r.created_at else None,
            }
            for r in reports
        ]
    })
