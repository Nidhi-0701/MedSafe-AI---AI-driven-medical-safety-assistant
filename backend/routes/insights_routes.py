"""
Dashboard Insights API.

GET /api/insights – aggregated statistics for dashboard graphs.
"""

from flask import Blueprint, jsonify
from sqlalchemy import func

from database.db import db
from database.models import (
    SideEffectReport,
    RiskCheckLog,
    InteractionCheckLog,
    SymptomCheckLog,
    PrescriptionScanLog,
    Patient,
)

insights_bp = Blueprint("insights", __name__)


@insights_bp.route("/insights", methods=["GET"])
def get_insights():
    """
    Return aggregated stats: total medicine checks, symptom reports, risk distribution, side-effect frequency.
    """
    try:
        total_medicine_checks = db.session.query(func.count(InteractionCheckLog.id)).scalar() or 0
        total_symptom_reports = db.session.query(func.count(SymptomCheckLog.id)).scalar() or 0
        total_side_effect_reports = db.session.query(func.count(SideEffectReport.id)).scalar() or 0
        total_risk_checks = db.session.query(func.count(RiskCheckLog.id)).scalar() or 0
        total_prescription_scans = db.session.query(func.count(PrescriptionScanLog.id)).scalar() or 0
        total_patients = db.session.query(func.count(Patient.id)).scalar() or 0
        active_patients = db.session.query(func.count(Patient.id)).filter(Patient.status == "Active").scalar() or 0

        risk_distribution = (
            db.session.query(RiskCheckLog.risk_level, func.count(RiskCheckLog.id))
            .group_by(RiskCheckLog.risk_level)
            .all()
        )
        risk_distribution = {level: count for level, count in risk_distribution}

        side_effect_by_medicine = (
            db.session.query(SideEffectReport.medicine, func.count(SideEffectReport.id))
            .group_by(SideEffectReport.medicine)
            .order_by(func.count(SideEffectReport.id).desc())
            .limit(20)
            .all()
        )
        side_effect_frequency = [{"medicine": m, "count": c} for m, c in side_effect_by_medicine]
    except Exception:
        total_medicine_checks = total_symptom_reports = total_side_effect_reports = 0
        total_risk_checks = total_prescription_scans = 0
        total_patients = active_patients = 0
        risk_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
        side_effect_frequency = []

    return jsonify({
        "total_medicine_checks": total_medicine_checks,
        "total_symptom_reports": total_symptom_reports,
        "total_side_effect_reports": total_side_effect_reports,
        "total_risk_checks": total_risk_checks,
        "total_prescription_scans": total_prescription_scans,
        "total_patients": total_patients,
        "active_patients": active_patients,
        "risk_distribution": {
            "LOW": risk_distribution.get("LOW", 0),
            "MEDIUM": risk_distribution.get("MEDIUM", 0),
            "HIGH": risk_distribution.get("HIGH", 0),
        },
        "side_effect_frequency": side_effect_frequency,
    })
