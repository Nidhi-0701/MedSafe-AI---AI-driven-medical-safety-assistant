"""
Create the PostgreSQL database used by MedSafe backend.

Why this exists:
- On some Windows setups, `psql` is not available on PATH.
- This script creates the DB using psycopg2 directly.

Usage (PowerShell):
  python scripts/create_postgres_db.py

Environment variables (optional):
  PGHOST (default: localhost)
  PGPORT (default: 5432)
  PGUSER (default: postgres)
  PGPASSWORD (required unless your server allows trust auth)
  PGDATABASE (default: postgres)          # maintenance db to connect to
  MEDSAFE_DB (default: medsafe)           # db name to create
"""

import os

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def main():
    host = os.getenv("PGHOST", "localhost")
    port = int(os.getenv("PGPORT", "5432"))
    user = os.getenv("PGUSER", "postgres")
    password = os.getenv("PGPASSWORD")
    maintenance_db = os.getenv("PGDATABASE", "postgres")
    target_db = os.getenv("MEDSAFE_DB", "medsafe")

    if not password:
        raise SystemExit("Missing PGPASSWORD env var. Set it in PowerShell: $env:PGPASSWORD='your_password'")

    conn = psycopg2.connect(
        dbname=maintenance_db,
        user=user,
        password=password,
        host=host,
        port=port,
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (target_db,))
    exists = cur.fetchone() is not None
    if not exists:
        cur.execute(f'CREATE DATABASE "{target_db}"')
        print(f"Created database: {target_db}")
    else:
        print(f"Database already exists: {target_db}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()

