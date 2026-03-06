"""
Patient Records API.

Provides simple CRUD endpoints for managing patient records used by the frontend.
"""

from datetime import date

from flask import Blueprint, jsonify, request

from database.db import db
from database.models import Patient

patient_bp = Blueprint("patients", __name__)


def _to_patient_dict(p: Patient) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "age": p.age,
        "condition": p.condition,
        "status": p.status,
        "risk": p.risk,
        "last_visit": p.last_visit.isoformat() if p.last_visit else None,
    }


@patient_bp.route("/patients", methods=["GET"])
def list_patients():
    """List patients. Optional query param: ?q=search_string"""
    q = (request.args.get("q") or "").strip().lower()
    query = Patient.query
    if q:
        like = f"%{q}%"
        query = query.filter(Patient.name.ilike(like))
    patients = query.order_by(Patient.created_at.desc()).limit(500).all()
    return jsonify({"patients": [_to_patient_dict(p) for p in patients]})


@patient_bp.route("/patients", methods=["POST"])
def create_patient():
    """
    Create a patient.
    Body: { name, age?, condition?, status?, risk?, last_visit? (YYYY-MM-DD) }
    """
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Missing required field: name"}), 400

    age = data.get("age")
    if age is not None:
        try:
            age = int(age)
        except (TypeError, ValueError):
            age = None

    condition = (data.get("condition") or "").strip() or None
    status = (data.get("status") or "Active").strip() or "Active"
    risk = (data.get("risk") or "Low").strip() or "Low"
    last_visit_raw = (data.get("last_visit") or "").strip()
    last_visit = None
    if last_visit_raw:
        try:
            y, m, d = [int(x) for x in last_visit_raw.split("-")]
            last_visit = date(y, m, d)
        except Exception:
            last_visit = None

    p = Patient(
        name=name,
        age=age,
        condition=condition,
        status=status,
        risk=risk,
        last_visit=last_visit,
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({"patient": _to_patient_dict(p)}), 201


@patient_bp.route("/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id: int):
    """Update a patient."""
    p = Patient.query.get(patient_id)
    if not p:
        return jsonify({"error": "Patient not found"}), 404
    data = request.get_json() or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "name cannot be empty"}), 400
        p.name = name
    if "age" in data:
        age = data.get("age")
        if age is None or age == "":
            p.age = None
        else:
            try:
                p.age = int(age)
            except (TypeError, ValueError):
                p.age = None
    if "condition" in data:
        p.condition = (data.get("condition") or "").strip() or None
    if "status" in data:
        p.status = (data.get("status") or "Active").strip() or "Active"
    if "risk" in data:
        p.risk = (data.get("risk") or "Low").strip() or "Low"
    if "last_visit" in data:
        lv = (data.get("last_visit") or "").strip()
        if not lv:
            p.last_visit = None
        else:
            try:
                y, m, d = [int(x) for x in lv.split("-")]
                p.last_visit = date(y, m, d)
            except Exception:
                p.last_visit = None

    db.session.commit()
    return jsonify({"patient": _to_patient_dict(p)})


@patient_bp.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id: int):
    """Delete a patient record."""
    p = Patient.query.get(patient_id)
    if not p:
        return jsonify({"error": "Patient not found"}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({"ok": True})

