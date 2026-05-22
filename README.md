# EasyMed

EasyMed is an AI-powered healthcare platform built with React, Tailwind CSS, FastAPI, and MongoDB. It is designed as a patient-facing healthcare intelligence workspace, not a traditional hospital management system.

## Features

- Premium healthcare landing page
- Patient login and signup pages
- Patient dashboard with reports, appointments, reminders, and AI insights
- Medical report upload page
- AI report summarizer placeholder API
- Symptom checker page with dummy AI guidance
- Appointment booking workflow
- Responsive UI for desktop and mobile
- FastAPI backend with MongoDB connection setup

## Project Structure

```text
EasyMed/
  backend/
    app/
      core/
      models/
      routes/
      main.py
    requirements.txt
    .env.example
  frontend/
    src/
      api/
      components/
      pages/
      App.jsx
      main.jsx
      styles.css
    package.json
    tailwind.config.js
    postcss.config.js
    index.html
  README.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB running locally, or a MongoDB Atlas connection string

The app still runs with dummy data if MongoDB is not available.

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

API docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## Environment Variables

Backend `.env`:

```env
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=easymed
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Frontend optional `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## API Routes

- `GET /health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `POST /api/reports/upload`
- `POST /api/ai/summarize-report`
- `POST /api/symptom-checker`
- `POST /api/ai/symptom-checker`
- `GET /api/appointments`
- `POST /api/appointments`

## Notes

AI responses are dummy placeholders for now. The current structure is ready for replacing placeholder logic with real LLM, medical document extraction, authentication, and persistent MongoDB collections.
