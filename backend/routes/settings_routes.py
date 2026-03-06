"""
Settings API.

Persists simple platform preferences used by the Settings page.
"""

import json

from flask import Blueprint, jsonify, request

from database.db import db
from database.models import AppSetting

settings_bp = Blueprint("settings", __name__)


DEFAULT_SETTINGS = {
    "profile": {"name": "Dr. Sarah Chen", "email": "sarah.chen@medsafe.ai"},
    "notifications": {
        "high_risk_interaction_alerts": True,
        "new_side_effect_reports": True,
        "emergency_risk_notifications": True,
    },
    "security": {
        "two_factor_authentication": True,
        "session_timeout_30_min": True,
        "audit_logging": False,
    },
}


def _get_setting(key: str, default):
    row = AppSetting.query.get(key)
    if not row:
        return default
    try:
        return json.loads(row.value)
    except Exception:
        return default


def _set_setting(key: str, value):
    row = AppSetting.query.get(key)
    payload = json.dumps(value)
    if row:
        row.value = payload
    else:
        row = AppSetting(key=key, value=payload)
        db.session.add(row)


@settings_bp.route("/settings", methods=["GET"])
def get_settings():
    """Return settings object."""
    settings = _get_setting("settings", DEFAULT_SETTINGS)
    return jsonify({"settings": settings})


@settings_bp.route("/settings", methods=["PUT"])
def update_settings():
    """Update settings object (replace)."""
    data = request.get_json() or {}
    settings = data.get("settings")
    if not isinstance(settings, dict):
        return jsonify({"error": "Body must be { settings: { ... } }"}), 400
    _set_setting("settings", settings)
    db.session.commit()
    return jsonify({"settings": settings})

