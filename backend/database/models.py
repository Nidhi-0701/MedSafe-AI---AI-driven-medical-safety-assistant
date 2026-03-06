"""
SQLAlchemy models for MedSafe AI.

Stores:
- Side-effect reports (medicine, dosage, symptoms, AI explanation)
- Patient / risk check logs (vitals, risk level)
- Interaction check logs (for dashboard insights)
- Symptom check logs (optional, for analytics)
"""

from datetime import datetime
from database.db import db


class Patient(db.Model):
    """Simple patient record for the Patient Records module."""

    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    condition = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), nullable=False, default="Active")  # Active, Monitoring, Critical
    risk = db.Column(db.String(20), nullable=False, default="Low")  # Low, Medium, High (display-only)
    last_visit = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SideEffectReport(db.Model):
    """Log of a side-effect report: medicine, dosage, symptoms, and AI-generated explanation."""

    __tablename__ = "side_effect_reports"

    id = db.Column(db.Integer, primary_key=True)
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    medicine = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(100), nullable=True)
    symptoms = db.Column(db.Text, nullable=False)  # Comma-separated or JSON
    explanation = db.Column(db.Text, nullable=True)  # AI-generated short explanation
    precaution = db.Column(db.Text, nullable=True)   # AI-generated precaution
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class RiskCheckLog(db.Model):
    """Log of an emergency risk prediction (heart rate, BP, SpO2, risk level)."""

    __tablename__ = "risk_check_logs"

    id = db.Column(db.Integer, primary_key=True)
    heart_rate = db.Column(db.Integer, nullable=True)
    blood_pressure_systolic = db.Column(db.Integer, nullable=True)
    blood_pressure_diastolic = db.Column(db.Integer, nullable=True)
    oxygen_level = db.Column(db.Integer, nullable=True)
    risk_level = db.Column(db.String(20), nullable=False)  # LOW, MEDIUM, HIGH
    recommendation = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class InteractionCheckLog(db.Model):
    """Log of a medicine interaction check (for dashboard stats)."""

    __tablename__ = "interaction_check_logs"

    id = db.Column(db.Integer, primary_key=True)
    medicines = db.Column(db.Text, nullable=False)  # JSON array or comma-separated
    interaction_level = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SymptomCheckLog(db.Model):
    """Optional: log of symptom checks for dashboard insights."""

    __tablename__ = "symptom_check_logs"

    id = db.Column(db.Integer, primary_key=True)
    symptoms = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PrescriptionScanLog(db.Model):
    """Optional: log of prescription OCR analyses for analytics."""

    __tablename__ = "prescription_scan_logs"

    id = db.Column(db.Integer, primary_key=True)
    medicines_count = db.Column(db.Integer, default=0)  # Number of medicines extracted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AppSetting(db.Model):
    """Key/value app settings persisted for the Settings page."""

    __tablename__ = "app_settings"

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
