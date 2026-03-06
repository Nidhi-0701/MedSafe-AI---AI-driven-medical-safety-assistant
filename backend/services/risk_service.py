"""
Emergency risk predictor based on vital signs (rule-based scoring).

Classifies risk as LOW, MEDIUM, or HIGH and returns a short recommendation.
"""

from typing import Optional


# Simple thresholds (can be tuned or moved to config)
HEART_RATE_LOW = 60
HEART_RATE_HIGH = 100
BP_SYSTOLIC_HIGH = 140
BP_SYSTOLIC_CRITICAL = 180
BP_DIASTOLIC_HIGH = 90
BP_DIASTOLIC_CRITICAL = 110
SPO2_LOW = 95
SPO2_CRITICAL = 90


def predict_risk(
    heart_rate: Optional[int] = None,
    blood_pressure: Optional[int] = None,
    oxygen_level: Optional[int] = None,
    blood_pressure_diastolic: Optional[int] = None,
) -> dict:
    """
    Rule-based risk classification from vitals.

    blood_pressure is treated as systolic if only one value is given.
    Returns: { "risk_level": "LOW"|"MEDIUM"|"HIGH", "risk_score": int (0-100), "recommendation": str }
    """
    score = 0
    reasons = []

    # Heart rate
    if heart_rate is not None:
        if heart_rate < HEART_RATE_LOW:
            score += 1
            reasons.append("low heart rate")
        elif heart_rate > HEART_RATE_HIGH:
            score += 2
            reasons.append("elevated heart rate")

    # Blood pressure (systolic / diastolic)
    if blood_pressure is not None:
        if blood_pressure >= BP_SYSTOLIC_CRITICAL:
            score += 3
            reasons.append("high systolic blood pressure")
        elif blood_pressure >= BP_SYSTOLIC_HIGH:
            score += 1
            reasons.append("elevated systolic blood pressure")
    if blood_pressure_diastolic is not None:
        if blood_pressure_diastolic >= BP_DIASTOLIC_CRITICAL:
            score += 2
            reasons.append("high diastolic blood pressure")
        elif blood_pressure_diastolic >= BP_DIASTOLIC_HIGH:
            score += 1
            reasons.append("elevated diastolic blood pressure")

    # Oxygen saturation
    if oxygen_level is not None:
        if oxygen_level < SPO2_CRITICAL:
            score += 3
            reasons.append("low oxygen level")
        elif oxygen_level < SPO2_LOW:
            score += 1
            reasons.append("slightly low oxygen level")

    # Classify
    if score >= 4:
        risk_level = "HIGH"
        recommendation = (
            "Seek medical attention soon. These readings may indicate a need for evaluation. "
            "If you have chest pain, severe breathlessness, or confusion, consider emergency care."
        )
    elif score >= 1:
        risk_level = "MEDIUM"
        recommendation = (
            "Some readings are outside the normal range. Consider rechecking and discussing with a healthcare provider. "
            "Do not rely on this as a diagnosis."
        )
    else:
        risk_level = "LOW"
        recommendation = (
            "Readings appear within typical ranges. Continue monitoring and maintain regular check-ups. "
            "This is not a substitute for professional medical advice."
        )

    # Convert rule score (0..~8) into a transparent 0..100 score for UI
    risk_score = max(0, min(100, int((score / 8) * 100))) if score > 0 else 0

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendation": recommendation,
        "reasons": reasons,
    }
