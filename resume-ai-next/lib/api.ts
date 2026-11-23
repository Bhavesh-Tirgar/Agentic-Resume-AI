/**
 * Full-Featured Resilient API Client for Agentic Resume AI
 * Connects Next.js Frontend directly to Django REST Framework backend on http://localhost:8000/api
 */

const API_BASE = "http://localhost:8000/api";

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("resume_ai_token");
};

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("resume_ai_token", token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("resume_ai_token");
  }
};

/**
 * Retrieves or generates an isolated anonymous guest identity for the current browser session.
 * Eliminates cross-user collision on shared accounts while maintaining seamless guest onboarding.
 */
function getOrGenerateGuestCredentials(): { username: string; password: string } {
  if (typeof window === "undefined") {
    return { username: "guest_server_default", password: "Password123!" };
  }

  const stored = localStorage.getItem("resume_ai_guest_creds");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.username && parsed.password) {
        return parsed;
      }
    } catch {}
  }

  const uniqueId = Math.random().toString(36).substring(2, 10);
  const creds = {
    username: `guest_${uniqueId}`,
    password: `SecGuest_${uniqueId}_${Math.random().toString(36).substring(2, 7)}!`,
  };
  localStorage.setItem("resume_ai_guest_creds", JSON.stringify(creds));
  return creds;
}

/**
 * Logs in or registers guest session to acquire fresh JWT token
 */
async function acquireFreshToken(): Promise<string> {
  const guestUser = getOrGenerateGuestCredentials();

  try {
    // 1. Try login with dynamic credentials
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guestUser),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.access) {
        setAuthToken(data.access);
        return data.access;
      }
    }

    // 2. If login failed (first time for this browser), register then login
    const regRes = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...guestUser, 
        email: `${guestUser.username}@resumeai.internal` 
      }),
    });

    if (regRes.ok || regRes.status === 400) {
      const retry = await fetch(`${API_BASE}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestUser),
      });

      if (retry.ok) {
        const data = await retry.json();
        if (data.access) {
          setAuthToken(data.access);
          return data.access;
        }
      }
    }
  } catch (err) {
    console.warn("Backend auth unreachable:", err);
  }

  return "";
}

/**
 * Ensures valid token, retrieving from storage or fetching fresh
 */
export async function ensureAuthenticatedSession(): Promise<string> {
  const existing = getAuthToken();
  if (existing) {
    return existing;
  }
  return acquireFreshToken();
}

/**
 * Universal fetch wrapper that automatically catches 401 Unauthorized,
 * wipes the invalid/expired token from localStorage, obtains a fresh token,
 * and retries the request once. Eliminates permanent 401 locks!
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  isFormData = false
): Promise<Response> {
  let token = await ensureAuthenticatedSession();

  const buildHeaders = (tok: string): HeadersInit => {
    const h: Record<string, string> = {};
    if (tok) {
      h["Authorization"] = `Bearer ${tok}`;
    }
    if (!isFormData) {
      h["Content-Type"] = "application/json";
    }
    return { ...h, ...(options.headers as Record<string, string> || {}) };
  };

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(token),
  });

  // If 401 Unauthorized, token expired or corrupted: refresh and retry
  if (res.status === 401) {
    removeAuthToken();
    token = await acquireFreshToken();
    if (token) {
      res = await fetch(url, {
        ...options,
        headers: buildHeaders(token),
      });
    }
  }

  return res;
}

// 1. Health & Connection Check
export async function checkBackendHealth(): Promise<{ status: "connected" | "offline"; message?: string }> {
  try {
    const res = await fetchWithAuth("/resume/", { method: "GET" });
    if (res.status === 200) {
      return { status: "connected" };
    }
    return { status: "offline", message: `HTTP ${res.status}` };
  } catch (err: any) {
    return { status: "offline", message: err.message || "Failed to reach server" };
  }
}

// 2. Resume Upload API
export async function uploadResumeApi(file: File): Promise<{
  resume_id: number;
  message: string;
  characters: number;
  status: string;
}> {
  const formData = new FormData();
  formData.append("resume_file", file);

  const res = await fetchWithAuth(
    "/resume/upload/",
    {
      method: "POST",
      body: formData,
    },
    true
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.resume_file?.[0] || "Resume upload failed");
  }

  return res.json();
}

// 3. Process Resume with Multi-Agent Engine
export async function processResumeApi(resumeId: number): Promise<any> {
  const res = await fetchWithAuth(`/ai/resume-process/${resumeId}/`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || "AI processing failed");
  }

  return res.json();
}

// 4. Retrieve Existing Processed Resume Results
export async function getResumeProcessResultApi(resumeId: number): Promise<any> {
  const res = await fetchWithAuth(`/ai/resume-process/${resumeId}/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to retrieve resume processing data");
  }

  return res.json();
}

// 5. Job Matching Engine API
export async function matchJobApi(
  resumeId: number,
  jobTitle: string,
  jobDescription: string
): Promise<{
  message: string;
  job_match_id: number;
  match_data: any;
}> {
  const res = await fetchWithAuth(`/ai/resume/${resumeId}/job-match/`, {
    method: "POST",
    body: JSON.stringify({
      job_title: jobTitle,
      job_description: jobDescription,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Job matching calculation failed");
  }

  return res.json();
}

// 6. Interview Planning Deck API
export async function createInterviewPlanApi(
  resumeId: number,
  jobMatchId: number
): Promise<{
  message: string;
  interview_plan_id: number;
  plan_data: any;
}> {
  const res = await fetchWithAuth(
    `/ai/resume/${resumeId}/job-match/${jobMatchId}/interview-plan/`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate interview plan");
  }

  return res.json();
}

export async function getInterviewPlanApi(
  resumeId: number,
  jobMatchId: number
): Promise<{
  interview_plan_id: number;
  plan_data: any;
  created_at: string;
}> {
  const res = await fetchWithAuth(
    `/ai/resume/${resumeId}/job-match/${jobMatchId}/interview-plan/`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    throw new Error("No existing interview plan found");
  }

  return res.json();
}

// 7. List User Resumes
export async function listUserResumesApi(): Promise<any[]> {
  const res = await fetchWithAuth("/resume/", { method: "GET" });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

// 8. Active Resume ID Persistence
export const getActiveResumeId = (): number => {
  if (typeof window === "undefined") return 1;
  const stored = localStorage.getItem("resume_ai_active_id");
  return stored ? parseInt(stored, 10) : 1;
};

export const setActiveResumeId = (id: number) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("resume_ai_active_id", id.toString());
  }
};

// 9. Job Discovery Scout API
export async function discoverJobsApi(
  resumeId: number,
  location: string = "Remote / Nationwide",
  workType: string = "All"
): Promise<{
  message: string;
  discovery_id: number;
  location_query: string;
  work_type: string;
  discovery_data: any;
}> {
  const res = await fetchWithAuth(`/ai/resume/${resumeId}/job-finder/`, {
    method: "POST",
    body: JSON.stringify({
      location,
      work_type: workType,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Job discovery failed");
  }

  return res.json();
}

export async function getDiscoveredJobsApi(resumeId: number): Promise<any> {
  const res = await fetchWithAuth(`/ai/resume/${resumeId}/job-finder/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to load discovered jobs");
  }

  return res.json();
}

// 10. Virtual HR Real-Time Interactive Mock Interview APIs
export async function startVirtualHRInterviewApi(payload: {
  candidate_name?: string;
  target_role?: string;
  resume_id?: number;
  max_rounds?: number;
}): Promise<{
  session_id: string;
  candidate_name: string;
  target_role: string;
  current_round: number;
  max_rounds: number;
  greeting: string;
  question: string;
  audio_base64?: string;
  category: string;
}> {
  const res = await fetchWithAuth("/ai/interview/live/start/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to start interview session");
  }

  return res.json();
}

export async function transcribeWhisperAudioApi(audioBase64: string): Promise<{
  transcribed_text: string;
  model: string;
}> {
  const res = await fetchWithAuth("/ai/interview/live/whisper/", {
    method: "POST",
    body: JSON.stringify({ audio_base64: audioBase64 }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Whisper transcription failed");
  }

  return res.json();
}

export async function sendVirtualHRAnswerApi(payload: {
  session_id: string;
  candidate_answer?: string;
  audio_base64?: string;
  vision_telemetry?: {
    eye_contact_percentage: number;
    confidence_score: number;
    nervousness_score: number;
    gaze_direction: string;
    facial_demeanor: string;
  };
  snapshot_base64?: string;
}): Promise<{
  session_id: string;
  round_evaluated: number;
  next_round: number;
  max_rounds: number;
  is_final_round: boolean;
  transcribed_text?: string;
  used_whisper?: boolean;
  evaluation: {
    star_score: number;
    clarity_score: number;
    strengths: string[];
    critique: string;
    behavioral_critique?: string;
    adaptive_hr_tone?: string;
    hr_followup_or_next_question: string;
    question_category: string;
    is_final_round: boolean;
    vision?: {
      eye_contact_percentage: number;
      confidence_score: number;
      nervousness_score: number;
      gaze_direction: string;
      facial_demeanor: string;
    };
  };
  next_question?: string;
  audio_base64?: string;
}> {
  const res = await fetchWithAuth("/ai/interview/live/turn/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to evaluate answer");
  }

  return res.json();
}

export async function finishVirtualHRInterviewApi(session_id: string): Promise<{
  session_id: string;
  status: string;
  scorecard: {
    overall_score: number;
    verdict: string;
    summary: string;
    communication_score: number;
    technical_depth_score: number;
    problem_solving_score: number;
    leadership_score: number;
    top_strengths: string[];
    critical_gaps: string[];
    preparation_recommendations: string[];
    behavioral_delivery?: {
      average_eye_contact: number;
      average_confidence: number;
      composure_under_pressure: number;
      executive_presence_grade: string;
      presence_strengths: string[];
      presence_areas_to_improve: string[];
    };
  };
  turns: any[];
}> {
  const res = await fetchWithAuth("/ai/interview/live/finish/", {
    method: "POST",
    body: JSON.stringify({ session_id }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to compile interview scorecard");
  }

  return res.json();
}

export async function getVirtualHRSessionApi(session_id: string): Promise<any> {
  const res = await fetchWithAuth(`/ai/interview/live/session/${session_id}/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to load interview session");
  }

  return res.json();
}

export async function getVirtualHRHistoryApi(): Promise<{
  total_records: number;
  history: Array<{
    id: number;
    session_id: string;
    candidate_name: string;
    target_role: string;
    verdict: string;
    overall_score: number;
    summary: string;
    top_strengths: string[];
    critical_gaps: string[];
    preparation_recommendations: string[];
    turns_count: number;
    created_at: string;
  }>;
}> {
  const res = await fetchWithAuth("/ai/interview/live/history/", {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Failed to load interview history");
  }

  return res.json();
}


