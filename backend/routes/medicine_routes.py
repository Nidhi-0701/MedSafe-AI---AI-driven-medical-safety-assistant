"""
Medicine Interaction Checker API.

POST /api/check-interaction – accepts list of medicine names, returns interaction level and notes.
"""

from flask import Blueprint, request, jsonify

from services.interaction_service import check_interaction
from database.db import db
from database.models import InteractionCheckLog

medicine_bp = Blueprint("medicine", __name__)


@medicine_bp.route("/check-interaction", methods=["POST"])
def check_interaction_route():
    """
    Accept JSON: { "medicines": ["paracetamol", "ibuprofen"] }.
    Returns interaction_level, explanation, safety_note (with fuzzy matching).
    """
    data = request.get_json() or {}
    medicines = data.get("medicines")
    if not isinstance(medicines, list):
        return jsonify({"error": "'medicines' must be an array of strings"}), 400
    medicines = [str(m).strip() for m in medicines if m]

    result = check_interaction(medicines)

    # Log for dashboard insights
    try:
        import json as _json
        log = InteractionCheckLog(
            medicines=_json.dumps(medicines),
            interaction_level=result.get("interaction_level"),
        )
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({
        "interaction_level": result["interaction_level"],
        "explanation": result["explanation"],
        "safety_note": result["safety_note"],
        "matched_medicines": result.get("matched_medicines", medicines),
        "known_interaction": result.get("known_interaction", False),
    })
