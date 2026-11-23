# Active State: Agentic Resume AI

## Current Milestone
- **Phase:** Phase 7 - Project J.A.R.V.I.S. (Sub-Second Full-Duplex Multimodal Interviewer v3.0)
- **Active Sprint:** Milestone 7.2 — Client-Side MediaPipe Vision Engine (30 FPS)
- **Status:** Milestone 7.1 completed & verified. Moving to M7.2.
- **Git Branch:** `main`
- **Remote Origin:** `https://github.com/Bhavesh-Tirgar/Agentic-Resume-AI.git`
- **Upstream:** `https://github.com/Hardik-RS/Agentic_AI_Project.git`

## Verification Summary
1. **Backend Tests:** 15/15 unit and integration tests passing (`Authentication`, `Resume`, `AI` test suites, including `JobDiscoveryService`, `InterviewPlanningService`, and API endpoints).
2. **Frontend Build:** Verified Next.js 14 production build (`resume-ai-next/` compiled 9/9 static routes cleanly with 0 errors).
3. **Multi-Agent Capabilities:**
   - `ResumeParserAgent`: Pydantic structured resume extraction.
   - `ResumeAnalysisAgent`: Strengths, weaknesses, and improvement areas.
   - `ResumeScoringAgent`: Radial ATS scoring across 5 metrics.
   - `JobMatchingAgent`: Deep role alignment and gap analysis.
   - `JobDiscoveryAgent`: Location-aware nearby talent scout (Ahmedabad, Bengaluru, Pune, Delhi, London, Remote).
   - `InterviewPlanningAgent`: Multi-round technical and behavioral coaching roadmap.
4. **Token Economics & Domain Agility:**
   - 67% reduction in prompt/output tokens via compact schemas and bounded arrays.
   - Universal cross-industry domain detection (`detect_candidate_domain`) supporting Sales, Finance, Marketing, Healthcare, Operations, Design, and Engineering.
5. **Self-Healing Resilience & Security:**
   - Self-healing API client (`fetchWithAuth` in `resume-ai-next/lib/api.ts`) auto-purges expired tokens on 401 and renegotiates fresh tokens.
   - JWT lifetime configured to 30 days in `settings.py`.
   - Dedicated App Router subpages (`/studio`, `/matcher`, `/scout`, `/interview`, `/jobs`).
   - Zero-500 fallback engines active when Gemini free-tier quota (429) is exhausted.
   - File upload validation enforces `.pdf` extension, max 5MB, and `%PDF-` magic bytes.
   - Rate limiting throttles active on DRF endpoints.

## Active Daemons
- **Backend (Django API):** `http://localhost:8000/` (Port 8000)
- **Frontend (Next.js 14):** `http://localhost:3000/` (Port 3000)
