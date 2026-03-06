"""
MedSafe AI – Intelligent Medication Safety & Health Insight Platform
Backend Application Entry Point

This Flask app provides REST APIs for:
- Symptom & Doubt Solver
- Medicine Interaction Checker
- Prescription Analyzer (OCR)
- Side-Effect Monitor
- Emergency Risk Predictor
- Dashboard Insights
"""

import os
from flask import Flask
from flask_cors import CORS

# Load environment variables before importing db (which may use them)
from dotenv import load_dotenv
load_dotenv()

# Import database and register blueprints after app creation
from database.db import init_db

# Route blueprints
from routes.symptom_routes import symptom_bp
from routes.medicine_routes import medicine_bp
from routes.prescription_routes import prescription_bp
from routes.risk_routes import risk_bp
from routes.side_effect_routes import side_effect_bp
from routes.insights_routes import insights_bp
from routes.admin_routes import admin_bp
from routes.patient_routes import patient_bp
from routes.settings_routes import settings_bp


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # ----- Configuration -----
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "medsafe-dev-secret-key")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload for prescription images

    # Database: use PostgreSQL if DATABASE_URL is set, else SQLite
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///medsafe.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ----- CORS: allow frontend to connect -----
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # ----- Initialize database -----
    init_db(app)

    # ----- Register API blueprints -----
    app.register_blueprint(symptom_bp, url_prefix="/api")
    app.register_blueprint(medicine_bp, url_prefix="/api")
    app.register_blueprint(prescription_bp, url_prefix="/api")
    app.register_blueprint(risk_bp, url_prefix="/api")
    app.register_blueprint(side_effect_bp, url_prefix="/api")
    app.register_blueprint(insights_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(patient_bp, url_prefix="/api")
    app.register_blueprint(settings_bp, url_prefix="/api")

    # ----- Health check (optional, for deployment) -----
    @app.route("/health")
    def health():
        return {"status": "ok", "service": "medsafe-api"}

    return app


# Create the application instance
app = create_app()


if __name__ == "__main__":
    # Run with: python app.py  OR  flask run
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "true").lower() == "true")
