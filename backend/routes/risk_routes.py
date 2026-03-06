"""
Emergency Risk Predictor API.

POST /api/risk-predict – accepts vitals (heart_rate, blood_pressure, oxygen_level), returns risk level.
"""

from flask import Blueprint, request, jsonify

from services.risk_service import predict_risk
from database.db import db
from database.models import RiskCheckLog

risk_bp = Blueprint("risk", __name__)


@risk_bp.route("/risk-predict", methods=["POST"])
def risk_predict():
    """
    Accept JSON: { "heart_rate": 120, "blood_pressure": 150, "oxygen_level": 90 }.
    blood_pressure can be a single number (systolic) or use blood_pressure_systolic / blood_pressure_diastolic.
    Returns risk_level (LOW | MEDIUM | HIGH) and recommendation.
    """
    data = request.get_json() or {}
    heart_rate = data.get("heart_rate")
    if heart_rate is not None:
        try:
            heart_rate = int(heart_rate)
        except (TypeError, ValueError):
            heart_rate = None
    blood_pressure = data.get("blood_pressure")
    if blood_pressure is not None:
        try:
            blood_pressure = int(blood_pressure)
        except (TypeError, ValueError):
            blood_pressure = None
    blood_pressure_diastolic = data.get("blood_pressure_diastolic")
    if blood_pressure_diastolic is not None:
        try:
            blood_pressure_diastolic = int(blood_pressure_diastolic)
        except (TypeError, ValueError):
            blood_pressure_diastolic = None
    oxygen_level = data.get("oxygen_level")
    if oxygen_level is not None:
        try:
            oxygen_level = int(oxygen_level)
        except (TypeError, ValueError):
            oxygen_level = None

    result = predict_risk(
        heart_rate=heart_rate,
        blood_pressure=blood_pressure,
        oxygen_level=oxygen_level,
        blood_pressure_diastolic=blood_pressure_diastolic,
    )

    # Log for dashboard insights
    try:
        log = RiskCheckLog(
            heart_rate=heart_rate,
            blood_pressure_systolic=blood_pressure,
            blood_pressure_diastolic=blood_pressure_diastolic,
            oxygen_level=oxygen_level,
            risk_level=result["risk_level"],
            recommendation=result["recommendation"],
        )
        db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({
        "risk_level": result["risk_level"],
        "risk_score": result.get("risk_score", 0),
        "recommendation": result["recommendation"],
        "reasons": result.get("reasons", []),
    })
