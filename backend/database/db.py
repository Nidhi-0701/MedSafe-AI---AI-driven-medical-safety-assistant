"""
Database connection and session management for MedSafe AI.

Uses SQLAlchemy with either SQLite (default) or PostgreSQL when DATABASE_URL is set.
"""

from flask_sqlalchemy import SQLAlchemy

# SQLAlchemy instance – import this in models and routes
db = SQLAlchemy()


def init_db(app):
    """Initialize the database with the Flask app and create tables."""
    db.init_app(app)
    with app.app_context():
        # Create all tables if they don't exist (SQLite/PostgreSQL)
        from database import models  # noqa: F401
        db.create_all()
    return db
