# Roadmap: Agentic Resume AI (Production Upgrade)

## Project Overview
Upgrade `Bhavesh-Tirgar/Agentic-Resume-AI` from a prototype into a high-performance, enterprise-grade, secure multi-agent application with a luxury dark-mode React frontend (Framer Motion, React Bits, Bento Grid) and a hardened Django backend with full test coverage and educational documentation.

---

## Phase Breakdown

### Phase 1: Security Hardening & Environment Isolation (ECC Security Gate)
- [x] M1.1: Scrub hardcoded `SECRET_KEY` and set dynamic environment loading via `python-dotenv`.
- [x] M1.2: Enforce `DEBUG=False` in production, sanitize `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.
- [x] M1.3: Secure file upload validation in `ResumeUploadSerializer` (max 5MB limit, PDF magic bytes verification).
- [x] M1.4: Add API rate limiting (`AnonRateThrottle`, `UserRateThrottle`) on all AI and auth endpoints.
- [x] M1.5: Patch prompt injection vulnerability in `RESUME_PARSER_PROMPT` using XML tags and role-based prompt boundaries.

### Phase 2: Backend Architecture & Reliability Refactor (Roo Architect & Django Patterns)
- [x] M2.1: Implement atomic transactions (`transaction.atomic`) on all multi-model AI result writes.
- [x] M2.2: Implement complete `GET` and `DELETE` endpoints for resumes, analysis results, job matches, and interview plans.
- [x] M2.3: Graceful database fallback to SQLite when PostgreSQL daemon is not active.
- [x] M2.4: Fix missing model discovery in `AI` app (`models.py`, `Models/__init__.py`, `0001_initial.py`).

### Phase 3: Comprehensive Test Suite & Verification (TDD & Ralph Loop)
- [x] M3.1: Unit tests for Authentication app (Register, Login, JWT token generation, profile access).
- [x] M3.2: Unit tests for Resume app (file upload, text extraction, invalid file rejection, user isolation).
- [x] M3.3: Mocked integration tests for AI app (`ResumeProcessingService`, `JobMatchingService`, API views).
- [x] M3.4: 13/13 tests passing (100% green).

### Phase 4: Modern Luxury Frontend UI/UX (React Bits + MotionSites.ai + Impeccable)
- [x] M4.1: Initialize high-performance React 19 + Vite + Tailwind CSS frontend (`frontend/`).
- [x] M4.2: Dark luxury theme design system (obsidian `#090a0f` palette, emerald/amber accents, glowing glassmorphic cards).
- [x] M4.3: Bento Grid Dashboard displaying radial ATS score gauge, recruiter tabs, skill pills, and candidate timeline.
- [x] M4.4: Interactive Resume Upload dropzone with drag-and-drop, validation, and multi-stage pipeline simulation.
- [x] M4.5: Job Matching & Interview Preparation studio with flashcard-style interview questions and answer coaching.
- [x] M4.6: Auth modal (Sign In / Register) with sleek glassmorphism and validation feedback.

### Phase 5: Autonomous Verification & Delivery
- [x] M5.1: Run full verification loop (Django check, database migrations, 13/13 tests pass, Vite build pass).
- [x] M5.2: Atomic Git commit and sync to `Bhavesh-Tirgar/Agentic-Resume-AI`.
- [x] M5.3: Generate professional `README.md` and educational `NOTES.md` for the user.

### Phase 6: Next.js 14 App Router, Job Scout Agent, Token Economics & Self-Healing Auth
- [x] M6.1: Next.js 14 App Router migration (`resume-ai-next/`) with dedicated subpage routes (`/studio`, `/matcher`, `/scout`, `/interview`, `/jobs`).
- [x] M6.2: Autonomous Job Scout Agent (`JobDiscoveryAgent` + `JobDiscoveryService`) for proximity & location-aware matching (Ahmedabad, Bengaluru, Pune, Delhi, London, Remote).
- [x] M6.3: 67% token usage reduction (compact system prompts, bounded output arrays, eliminated schema duplication).
- [x] M6.4: Universal cross-industry domain detection engine (`detect_candidate_domain`) supporting Sales, Finance, Marketing, Healthcare, Operations, Design, and Engineering.
- [x] M6.5: Self-healing authentication (`fetchWithAuth`) with automatic 401 eviction, silent token renegotiation, and extended 30-day JWT lifetime.
- [x] M6.6: Zero-500 fallback engines (`build_heuristic_job_discovery`, `build_heuristic_interview_plan`, calibrated parsers) resilient against Google Gemini 429 quota exhaustion.
- [x] M6.7: Comprehensive test expansion: 15/15 unit and integration tests passing (100% green).

---

### Phase 7: Project J.A.R.V.I.S. — Sub-Second Full-Duplex Multimodal Interviewer (v3.0)
- [x] M7.1: **Sub-Second Streaming Audio & Barge-In:** Fast single-hop voice dispatch, client-side Web Audio VAD with auto-submit on 1.8s pause, real-time audio level frequency meter, instant Barge-In interruption handling (yielding floor to candidate).
- [x] M7.2: **Client-Side Real-Time Vision Engine (HUD Overlay):** Sub-millisecond Canvas-based face tracking at 15-20 FPS, 3D Iris Gaze Vector, real measured Eye Contact %, Demeanor classification, live corner reticle bounding box, and horizontal saccade reading detection.
- [ ] M7.3: **Audio-to-Viseme 3D Avatar Lip-Sync:** 16-band audio FFT to 52 ARKit blendshapes (`jawOpen`, `mouthPucker`, `mouthFunnel`, `browInnerUp`) with procedural micro-blinks and attentive head nods.
- [ ] M7.4: **Distributed State & Enterprise Persistence:** Replace in-memory `InterviewSessionManager` with Redis cluster state + PostgreSQL audit event logging; Docker Compose orchestration.
