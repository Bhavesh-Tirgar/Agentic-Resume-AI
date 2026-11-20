# 🚀 Agentic Resume AI

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.15-blue.svg?logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.2%20%7C%206.1-092E20.svg?logo=django&logoColor=white)](https://djangoproject.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00.svg?logo=langchain&logoColor=white)](https://langchain.com)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**An enterprise-grade, multi-agent AI system for intelligent resume evaluation, ATS readiness scoring, skill gap analysis, and tailored interview coaching.**

[Explore Architecture](#-system-architecture) • [Security Hardening](#-security-hardening--ecc-gate) • [Quickstart](#-quickstart) • [Detailed Notes](NOTES.md)

</div>

---

## 🌟 Overview

**Agentic Resume AI** transforms static resume screening into an autonomous, multi-agent evaluation pipeline. Built on **Django REST Framework**, **LangGraph**, and **Google Gemini**, the platform ingests resume PDFs, extracts and validates structured biographical data, simulates executive recruiter feedback, computes an objective ATS readiness score, and builds personalized interview preparation flashcards.

Coupled with a **luxury obsidian dark-mode React frontend** (Framer Motion, Bento Grid, React Bits craft), it eliminates generic AI slop in favor of high information density and instant recruiter insights.

---

## 🧠 System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite + Tailwind + Framer Motion)"]
        UI_Drop["Drag-and-Drop Resume PDF"]
        UI_Bento["Bento Grid ATS Dashboard"]
        UI_Match["Target Job Description Matcher"]
        UI_Deck["Interactive Interview Flashcards"]
    end

    subgraph Gateway ["Django REST Framework (Hardened API Gateway)"]
        GW_Auth["JWT Token Auth (SimpleJWT)"]
        GW_Throttle["Rate Limiting (Anon & User Throttles)"]
        GW_Security["Magic Byte (%PDF-) File Validation"]
    end

    subgraph MultiAgent ["LangGraph Multi-Agent Swarm (Google Gemini)"]
        A_Parse["ResumeParserAgent<br/>(Pydantic Schema Deserializer)"]
        A_Analyze["ResumeAnalysisAgent<br/>(Recruiter Strengths & Gaps)"]
        A_Score["ResumeScoringAgent<br/>(ATS Metric Benchmarking)"]
        A_Match["JobMatchingAgent<br/>(Skill Overlap & Gap Matrix)"]
        A_Interview["InterviewPlannerAgent<br/>(Adaptive Role Preparation)"]
    end

    subgraph Persistence ["Relational Storage"]
        DB[(PostgreSQL / SQLite Database)]
    end

    UI_Drop -->|Multipart Upload| Gateway
    Gateway --> MultiAgent
    MultiAgent -->|Atomic Transaction| DB
    DB --> UI_Bento
    UI_Bento --> UI_Match --> UI_Deck
```

---

## 🛡️ Security Hardening & ECC Gate

This codebase incorporates rigorous security fixes over standard prototype implementations:

* **File Signature Verification:** `ResumeUploadSerializer` inspects binary magic bytes (`b"%PDF-"`) to prevent malicious executables and decompression bombs.
* **Prompt Injection Defense:** Untrusted extracted document text is isolated inside `<candidate_resume_untrusted>` XML boundaries with strict instructions forbidding the model from executing user commands.
* **Environment-Isolated Secrets:** Zero hardcoded keys. `SECRET_KEY`, `DEBUG`, and database credentials are dynamically resolved via `.env`.
* **Database ACID Safety:** Multi-table AI result persistence is wrapped inside `@transaction.atomic` to prevent partial or orphaned records.
* **API Throttling:** Configured DRF throttling (`AnonRateThrottle` & `UserRateThrottle`) protects Gemini API quotas from abuse.

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend Framework** | Python 3.11+, Django 5/6, Django REST Framework |
| **Authentication** | `djangorestframework-simplejwt` (Stateless JWT) |
| **Multi-Agent Orchestration** | `langgraph` (StateGraph), `langchain-google-genai` (Google Gemini) |
| **Data Contracts** | `pydantic` v2, `email-validator` |
| **Document Processing** | `pymupdf` (fitz native text extraction), `pytesseract` (OCR) |
| **Database** | PostgreSQL (`psycopg2`) with seamless SQLite (`db.sqlite3`) local fallback |
| **Frontend Framework** | React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti |

---

## ⚡ Quickstart

### 1. Clone & Setup Workspace
```powershell
git clone https://github.com/Bhavesh-Tirgar/Agentic-Resume-AI.git
cd Agentic-Resume-AI
```

### 2. Run Backend (Django REST Framework)
```powershell
cd ResumeAI

# Setup environment
copy .env.example .env

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Start backend server
python manage.py runserver 8000
```
Backend API will be active at: `http://localhost:8000`

### 3. Run Frontend (React 19 + Vite)
```powershell
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend interface will open at: `http://localhost:5173`

---

## 🧪 Automated Testing

Run the test suite covering authentication, file upload security, and mocked agent graphs:
```powershell
cd ResumeAI
python manage.py test
```

---

## 📄 License & Attribution
Distributed under the MIT License. Developed with pride by [Bhavesh Tirgar](https://github.com/Bhavesh-Tirgar).
