"""
Prescription Analyzer API.

POST /api/analyze-prescription – accepts image upload, runs OCR and Gemini to return structured medicines.
"""

import os
import tempfile
from flask import Blueprint, request, jsonify

from services.ocr_service import extract_text_from_image
from services.gemini_service import generate_prescription_structure
from database.db import db
from database.models import PrescriptionScanLog

prescription_bp = Blueprint("prescription", __name__)

# Allowed extensions for upload
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "bmp", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@prescription_bp.route("/analyze-prescription", methods=["POST"])
def analyze_prescription():
    """
    Accept multipart/form-data with key 'image' or 'file' (prescription image).
    Returns { "medicines": [ { "name": "...", "active_salt": "..." } ] }.
    """
    file = request.files.get("image") or request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No image uploaded. Use 'image' or 'file' form field."}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": f"Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"}), 400

    path = None
    try:
        fd, path = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1] or ".png")
        os.close(fd)
        file.save(path)
        ocr_text = extract_text_from_image(path)
        result = generate_prescription_structure(ocr_text)
        if result is None:
            return jsonify({
                "error": "AI service unavailable. Please set GEMINI_API_KEY.",
                "extracted_text_preview": (ocr_text[:500] + "...") if len(ocr_text) > 500 else ocr_text,
            }), 503
        medicines = result.get("medicines") or []
        # Log for insights
        try:
            log = PrescriptionScanLog(medicines_count=len(medicines))
            db.session.add(log)
            db.session.commit()
        except Exception:
            db.session.rollback()
        return jsonify({"medicines": medicines, "extracted_text_preview": ocr_text[:300] if ocr_text else None})
    finally:
        if path and os.path.exists(path):
            try:
                os.unlink(path)
            except Exception:
                pass
