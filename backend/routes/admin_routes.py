"""
Development-only admin utilities.

This module provides a demo seeding endpoint so the dashboard has data to display.

Important: Do NOT expose these endpoints publicly in production without authentication.
"""

import json
import random
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from database.db import db
from database.models import (
    InteractionCheckLog,
    PrescriptionScanLog,
    RiskCheckLog,
    SideEffectReport,
    SymptomCheckLog,
    Patient,
)

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/seed-demo", methods=["POST"])
def seed_demo():
    """
    Seed demo data for charts and stat cards.

    Body (optional):
      { "days": 14, "count": 40 }
    """
    data = request.get_json(silent=True) or {}
    days = int(data.get("days", 14))
    count = int(data.get("count", 40))
    days = max(1, min(days, 90))
    count = max(5, min(count, 500))

    # Some realistic-ish demo values
    medicines_pool = [
        "Paracetamol",
        "Ibuprofen",
        "Aspirin",
        "Metformin",
        "Atorvastatin",
        "Amoxicillin",
        "Omeprazole",
        "Warfarin",
        "Cetirizine",
        "Lisinopril",
    ]
    symptom_pool = [
        "headache",
        "dizziness",
        "nausea",
        "fatigue",
        "stomach upset",
        "mild fever",
        "cough",
        "sore throat",
        "muscle pain",
        "rash",
    ]
    side_effect_pool = [
        "nausea",
        "stomach upset",
        "drowsiness",
        "diarrhea",
        "mild rash",
        "headache",
        "heartburn",
    ]
    genders = ["Male", "Female", "Other"]

    now = datetime.utcnow()
    created = {"interactions": 0, "symptoms": 0, "side_effects": 0, "risks": 0, "scans": 0}

    for _ in range(count):
        # Spread over N days
        created_at = now - timedelta(days=random.randint(0, days), hours=random.randint(0, 23), minutes=random.randint(0, 59))

        # Interaction check
        meds = random.sample(medicines_pool, k=2)
        level = random.choices(["LOW", "MEDIUM", "HIGH"], weights=[70, 25, 5])[0]
        db.session.add(
            InteractionCheckLog(
                medicines=json.dumps(meds),
                interaction_level=level,
                created_at=created_at,
            )
        )
        created["interactions"] += 1

        # Symptom check
        sym = " and ".join(random.sample(symptom_pool, k=2))
        db.session.add(SymptomCheckLog(symptoms=sym, created_at=created_at))
        created["symptoms"] += 1

        # Side effect report
        med = random.choice(medicines_pool)
        se = ", ".join(random.sample(side_effect_pool, k=2))
        db.session.add(
            SideEffectReport(
                age=random.randint(18, 75),
                gender=random.choice(genders),
                medicine=med,
                dosage=random.choice(["250mg", "500mg", "10mg", "20mg", "1 tablet"]),
                symptoms=se,
                explanation="Educational note: some medicines can cause mild side effects in some people.",
                precaution="If symptoms are severe or persistent, consult a healthcare professional.",
                created_at=created_at,
            )
        )
        created["side_effects"] += 1

        # Risk check
        risk_level = random.choices(["LOW", "MEDIUM", "HIGH"], weights=[75, 20, 5])[0]
        db.session.add(
            RiskCheckLog(
                heart_rate=random.randint(55, 130),
                blood_pressure_systolic=random.randint(95, 190),
                blood_pressure_diastolic=random.randint(55, 115),
                oxygen_level=random.randint(88, 100),
                risk_level=risk_level,
                recommendation="Educational note: monitor vitals and consult a clinician for personalized guidance.",
                created_at=created_at,
            )
        )
        created["risks"] += 1

        # Prescription scan log
        db.session.add(PrescriptionScanLog(medicines_count=random.randint(1, 4), created_at=created_at))
        created["scans"] += 1

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to seed demo data"}), 500

    # Seed a few demo patients if none exist yet
    try:
        if Patient.query.count() == 0:
            demo_patients = [
                Patient(name="John Doe", age=45, condition="Hypertension", status="Active", risk="Medium"),
                Patient(name="Jane Smith", age=32, condition="Diabetes Type 2", status="Active", risk="Low"),
                Patient(name="Robert Johnson", age=58, condition="Cardiac Arrhythmia", status="Critical", risk="High"),
                Patient(name="Emily Davis", age=27, condition="Asthma", status="Active", risk="Low"),
                Patient(name="Michael Brown", age=64, condition="COPD", status="Monitoring", risk="Medium"),
            ]
            for p in demo_patients:
                db.session.add(p)
            db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({"ok": True, "seeded": created, "note": "Demo data inserted. Refresh dashboard."})

