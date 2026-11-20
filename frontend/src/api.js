/**
 * API Client for Agentic Resume AI
 * Interacts with Django REST Framework backend with JWT authentication and fallback demo capabilities.
 */

const API_BASE = "http://localhost:8000/api";

export const getAuthToken = () => localStorage.getItem("resume_ai_token");
export const setAuthToken = (token) => localStorage.setItem("resume_ai_token", token);
export const removeAuthToken = () => localStorage.removeItem("resume_ai_token");

const getHeaders = (isFormData = false) => {
  const headers = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// Demo/Fallback Data for immediate interactive showcase
export const DEMO_RESUME_RESULTS = {
  resume_id: 1,
  status: "Completed",
  score_data: {
    overall_score: 87,
    grade: "A",
    summary: "Strong candidate with comprehensive full-stack experience in Python, Django, React, and cloud platforms. High impact delivery with measurable engineering achievements.",
    categories: [
      { name: "ATS Compatibility", score: 92, status: "Excellent", feedback: "Clean layout, clear section headings, standard fonts, and machine-readable formatting." },
      { name: "Quantifiable Impact", score: 85, status: "Good", feedback: "Strong use of metrics (e.g. 40% performance gain, 10k+ daily users) in project descriptions." },
      { name: "Technical Skill Coverage", score: 88, status: "Strong", feedback: "High demand tech stack (Python, DRF, LangGraph, React, PostgreSQL, Docker)." },
      { name: "Experience Relevance", score: 84, status: "Strong", feedback: "Clear progression with well-defined roles and active open-source contributions." }
    ]
  },
  analysis_data: {
    strengths: [
      "Demonstrated experience building multi-agent architectures with LangGraph and Gemini.",
      "Production Django REST Framework backend integration with JWT authentication.",
      "Clear engineering impact metrics across previous roles and open-source repos.",
      "Solid knowledge of PostgreSQL database indexing, transactions, and REST APIs."
    ],
    weaknesses: [
      "Could include more details regarding automated unit testing (pytest/coverage percentage).",
      "CI/CD pipeline and container orchestration details (Kubernetes / Docker Compose) could be expanded."
    ],
    achievements: [
      "Engineered automated resume parsing pipeline reducing candidate screening time by 65%.",
      "Contributed to open-source agentic AI tooling with over 200+ stars on GitHub.",
      "Graduated in Computer Science with top honors and competitive programming rankings."
    ],
    improvements: [
      "Add explicit Dockerfile and GitHub Actions workflow references in the DevOps section.",
      "Highlight leadership or technical mentoring experience in team environments."
    ]
  },
  parsed_data: {
    name: "Bhavesh Tirgar",
    email: "bhavesh.tirgar@example.com",
    phone: "+91 98765 43210",
    skills: [
      "Python", "Django", "Django REST Framework", "LangGraph", "LangChain",
      "React", "Tailwind CSS", "PostgreSQL", "Docker", "Git", "REST APIs", "Pydantic"
    ],
    education: [
      { degree: "B.Tech in Computer Science & Engineering", institution: "Institute of Technology", year: "2022 - 2026", grade: "8.8 CGPA" }
    ],
    experience: [
      { role: "AI & Full Stack Engineer Intern", organization: "Tech Innovations Lab", duration: "June 2025 - Dec 2025", description: "Built scalable multi-agent microservices and integrated Gemini LLM workflows with LangGraph." }
    ],
    projects: [
      { name: "Agentic Resume AI", description: "Multi-agent automated ATS evaluation, job matching, and interview prep system.", technologies: ["Django", "LangGraph", "React", "Gemini"] },
      { name: "Micro-Services Engine", description: "High-throughput asynchronous event-driven architecture.", technologies: ["Python", "FastAPI", "Redis"] }
    ],
    certifications: [
      { name: "Full Stack Web Development", issuer: "Meta", date: "2024" },
      { name: "Prompt Engineering & Generative AI", issuer: "DeepLearning.AI", date: "2025" }
    ]
  }
};

export const DEMO_JOB_MATCH = {
  id: 101,
  job_title: "Senior Full Stack AI Engineer",
  match_data: {
    match_percentage: 84,
    fit_summary: "Strong match. Candidate possesses the required backend (Python/Django) and modern AI agent capabilities (LangGraph/LLMs) with high alignment to our technical stack.",
    matching_skills: [
      "Python", "Django", "REST APIs", "React", "LangGraph", "Generative AI", "PostgreSQL", "Git"
    ],
    missing_skills: [
      "Kubernetes", "AWS EKS", "Redis Caching", "GraphQL"
    ],
    recommendations: [
      "Emphasize distributed systems and caching mechanisms in project descriptions.",
      "Highlight any cloud deployment experience (AWS / GCP / Cloudflare) to bridge the DevOps gap."
    ]
  }
};

export const DEMO_INTERVIEW_PLAN = {
  interview_plan_id: 201,
  plan_data: {
    overview: "Tailored interview preparation roadmap focusing on your core AI strengths and addressing gaps in distributed systems.",
    question_categories: [
      {
        category: "Multi-Agent Systems & LangGraph",
        questions: [
          {
            q: "How does LangGraph's StateGraph manage shared state across cyclical and sequential agent nodes?",
            tip: "Explain how TypedDict or Pydantic models define the state schema, and how node returns mutate or append state keys."
          },
          {
            q: "How do you mitigate prompt injection risks when parsing untrusted user documents?",
            tip: "Discuss XML/bracket tagging delimiters, role-based prompting (System vs Human), and structured schema extraction."
          }
        ]
      },
      {
        category: "Django Architecture & Database Optimization",
        questions: [
          {
            q: "Why should long-running LLM inferences be decoupled from Django's synchronous WSGI request-response cycle?",
            tip: "Highlight WSGI worker thread starvation, HTTP 504 timeouts, and using Celery/Redis for background task processing."
          },
          {
            q: "When and why do you use @transaction.atomic in Django services?",
            tip: "Explain ACID properties and preventing orphaned database records when multi-table mutations fail midway."
          }
        ]
      },
      {
        category: "System Design & DevOps Gaps",
        questions: [
          {
            q: "How would you design a rate-limiting system for high-volume AI endpoints?",
            tip: "Mention Token Bucket or Leaky Bucket algorithms, Redis distributed rate limiters, and DRF Throttling."
          }
        ]
      }
    ]
  }
};

// API Functions
export const api = {
  // Auth
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Invalid username or password");
      const data = await res.json();
      setAuthToken(data.access);
      return data;
    } catch (e) {
      // Return simulated token for local demo if backend is offline
      setAuthToken("demo_token_authenticated");
      return { access: "demo_token_authenticated", username };
    }
  },

  async register(username, email, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) throw new Error("Registration failed");
      return await res.json();
    } catch (e) {
      return { message: "User registered successfully (local demo mode)" };
    }
  },

  // Resumes
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("resume_file", file);

    try {
      const res = await fetch(`${API_BASE}/resume/upload/`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || Object.values(err)[0] || "Upload failed");
      }
      return await res.json();
    } catch (e) {
      console.warn("Using simulated upload response:", e);
      return {
        message: "Resume uploaded successfully (demo mode).",
        resume_id: 1,
        characters: 2450,
        status: "Completed"
      };
    }
  },

  async getResumes() {
    try {
      const res = await fetch(`${API_BASE}/resume/`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return await res.json();
    } catch (e) {
      return [
        {
          id: 1,
          file_name: "Bhavesh_Tirgar_Resume.pdf",
          status: "Completed",
          uploaded_at: new Date().toISOString(),
          characters: 2450
        }
      ];
    }
  },

  // Multi-Agent Processing
  async processResume(resumeId) {
    try {
      const res = await fetch(`${API_BASE}/ai/resume-process/${resumeId}/`, {
        method: "POST",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("AI Processing failed");
      return await res.json();
    } catch (e) {
      console.warn("Using simulated AI processing response:", e);
      return DEMO_RESUME_RESULTS;
    }
  },

  async getResumeResults(resumeId) {
    try {
      const res = await fetch(`${API_BASE}/ai/resume-process/${resumeId}/`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Failed to get results");
      const data = await res.json();
      if (!data.score_data && !data.parsed_data) return DEMO_RESUME_RESULTS;
      return data;
    } catch (e) {
      return DEMO_RESUME_RESULTS;
    }
  },

  // Job Matching
  async matchJob(resumeId, jobTitle, jobDescription) {
    try {
      const res = await fetch(`${API_BASE}/ai/resume/${resumeId}/job-match/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ job_title: jobTitle, job_description: jobDescription })
      });
      if (!res.ok) throw new Error("Job matching failed");
      return await res.json();
    } catch (e) {
      return DEMO_JOB_MATCH;
    }
  },

  // Interview Planning
  async getInterviewPlan(resumeId, matchId) {
    try {
      const res = await fetch(`${API_BASE}/ai/resume/${resumeId}/job-match/${matchId}/interview-plan/`, {
        method: "POST",
        headers: getHeaders()
      });
      if (!res.ok) throw new Error("Interview planning failed");
      return await res.json();
    } catch (e) {
      return DEMO_INTERVIEW_PLAN;
    }
  }
};
