# MedSafe AI – Backend

REST API backend for the **MedSafe AI – Intelligent Medication Safety & Health Insight Platform**. Built with **Python** and **Flask**; uses **Google Gemini** for AI responses and **SQLite/PostgreSQL** for storage.

---

## Project structure

```
backend/
├── app.py                  # Flask app entry, CORS, blueprint registration
├── requirements.txt        # Python dependencies
├── .env.example            # Copy to .env and set GEMINI_API_KEY (optional)
├── README.md               # This file
├── data/
│   └── interactions.json   # Medicine interaction dataset (editable)
├── database/
│   ├── db.py               # SQLAlchemy init, create tables
│   └── models.py           # SideEffectReport, RiskCheckLog, etc.
├── routes/
│   ├── symptom_routes.py   # POST /api/symptom-check
│   ├── medicine_routes.py  # POST /api/check-interaction
│   ├── prescription_routes.py  # POST /api/analyze-prescription
│   ├── risk_routes.py      # POST /api/risk-predict
│   ├── side_effect_routes.py   # POST /api/side-effect
│   └── insights_routes.py  # GET /api/insights
├── services/
│   ├── gemini_service.py   # Reusable Gemini API (symptom, prescription, side-effect)
│   ├── ocr_service.py     # Tesseract / EasyOCR for prescription images
│   ├── interaction_service.py  # Fuzzy matching + interaction lookup
│   └── risk_service.py    # Rule-based risk (LOW/MEDIUM/HIGH)
└── utils/
    └── prompts.py         # AI prompt templates (educational, non-diagnostic)
```

---

## Setup and run

### 1. Python

Use **Python 3.9+**.

### 2. Virtual environment (recommended)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment variables

Copy the example env file and set your Gemini API key (needed for symptom check, prescription analysis, and side-effect explanation):

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `.env` and set:

- `GEMINI_API_KEY` – get one at [Google AI Studio](https://aistudio.google.com/apikey).

Optional:

- `DATABASE_URL` – PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/medsafe`). If not set, **SQLite** is used (`medsafe.db` in the backend folder).
- `PORT` – default `5000`.
- `USE_EASY_OCR=true` – use EasyOCR instead of Tesseract for prescription OCR.

### 5. OCR (for prescription analyzer)

- **Tesseract**: install [Tesseract](https://github.com/tesseract-ocr/tesseract) and ensure the `tesseract` binary is on your PATH.
- **EasyOCR**: no extra install; set `USE_EASY_OCR=true` if you prefer it (slower first run).

### 6. Run the server

```bash
python app.py
```

Or:

```bash
flask run
```

Server runs at **http://127.0.0.1:5000** (or the port you set). The frontend can call the APIs; CORS is enabled for `/api/*`.

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/symptom-check` | Symptom & doubt solver (Gemini). Body: `{"symptoms": "headache and dizziness"}` |
| POST | `/api/check-interaction` | Medicine interaction check. Body: `{"medicines": ["paracetamol", "ibuprofen"]}` |
| POST | `/api/analyze-prescription` | Prescription OCR + Gemini. Form: `image` or `file` (image file) |
| POST | `/api/side-effect` | Report side effect; store in DB; Gemini explanation. Body: `age`, `gender`, `medicine`, `dosage`, `symptoms` |
| POST | `/api/risk-predict` | Emergency risk from vitals. Body: `heart_rate`, `blood_pressure`, `oxygen_level` |
| GET | `/api/insights` | Dashboard stats: totals, risk distribution, side-effect frequency |
| GET | `/health` | Health check |

---

## Database

- **SQLite** (default): creates `medsafe.db` in the backend directory. No extra setup.
- **PostgreSQL**: set `DATABASE_URL` in `.env`. Tables are created on first run via `db.create_all()`.

Tables: `side_effect_reports`, `risk_check_logs`, `interaction_check_logs`, `symptom_check_logs`, `prescription_scan_logs`.

---

## Notes

- AI responses are written to be **educational and non-diagnostic**; prompts are in `utils/prompts.py`.
- Interaction data is in `data/interactions.json`; you can add more pairs and adjust text.
- For production, set a strong `SECRET_KEY` and restrict CORS origins.
