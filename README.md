# MedSafe AI – AI-Driven Medical Safety Assistant

MedSafe AI is an intelligent healthcare safety platform designed to help patients, doctors, and healthcare providers detect medication risks, analyze prescriptions, and generate actionable health insights using AI.

The platform combines OCR, AI analysis, and a smart dashboard to simulate a **mini digital hospital environment** where medicine safety and patient monitoring become easier and faster.

---

## 🚀 Key Features

### 📄 AI Prescription Analyzer

Upload or scan a prescription image and automatically extract medicines using OCR and AI.

### ⚠️ Drug Interaction Checker

Detect dangerous interactions between multiple medicines and warn users about potential risks.

### 🧠 Symptom Solver

Enter symptoms and receive AI-generated possible conditions and recommended precautions.

### 💊 Side Effect Monitor

Track side effects caused by medicines and identify possible causes.

### 🚑 Emergency Risk Detector

Analyze symptoms and medication history to detect possible emergency situations.

### 📊 Health Insights Dashboard

A centralized dashboard with graphs and insights showing:

* medicine usage trends
* interaction risks
* patient safety alerts
* health analytics

### 👨‍⚕️ Patient Management

Manage patient data, prescriptions, and medication records in one place.

---

## 🏗 System Architecture

Frontend
React + TypeScript + TailwindCSS + ShadCN UI

Backend
Python + Flask

AI Layer
Google Gemini API

OCR
Tesseract + EasyOCR

Database
PostgreSQL

---

## ⚙️ Project Structure

```
medsafe-ai
│
├── frontend (React Dashboard)
│
├── backend
│   ├── routes
│   ├── services
│   ├── database
│   ├── utils
│   └── app.py
│
└── README.md
```

---

## 🧠 AI Capabilities

MedSafe AI uses **Generative AI and rule-based safety checks** to:

* analyze prescriptions
* identify drug interactions
* generate health insights
* assist symptom analysis
* flag medical risks

---

## 💻 Running the Project Locally

### 1️⃣ Clone Repository

```
git clone https://github.com/Nidhi-0701/MedSafe-AI---AI-driven-medical-safety-assistant.git
cd MedSafe-AI---AI-driven-medical-safety-assistant
```

### 2️⃣ Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```


```

Run backend:

```
python app.py
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 📊 Use Cases

* Hospitals checking prescription safety
* Patients verifying medicines
* Pharmacists detecting drug conflicts
* Health analytics dashboards
* AI-assisted medical safety systems

---

## 🔒 Disclaimer

This project is intended for **educational and research purposes only**.
It should not replace professional medical advice.

---

## 👩‍💻 Author

Nidhi Shirsath

---

## ⭐ Future Improvements

* Real medical drug interaction APIs
* Patient health history analysis
* Doctor collaboration system
* Real-time medical alerts
* Mobile application
