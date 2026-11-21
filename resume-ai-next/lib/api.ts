/**
 * Full-Featured API Client for Agentic Resume AI
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
 * Ensure active authentication session. If no token exists, automatically
 * initializes a guest account session with Django backend.
 */
export async function ensureAuthenticatedSession(): Promise<string> {
  const existing = getAuthToken();
  if (existing) {
    return existing;
  }

  // Create or login default guest session
  const guestUser = {
    username: "guest_architect",
    password: "Password123!",
  };

  try {
    // Attempt login
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guestUser),
    });

    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.access);
      return data.access;
    }

    // If login fails, register and obtain token
    await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...guestUser, email: "guest@resumeai.internal" }),
    });

    const retryRes = await fetch(`${API_BASE}/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guestUser),
    });

    if (retryRes.ok) {
      const data = await retryRes.json();
      setAuthToken(data.access);
      return data.access;
    }
  } catch (err) {
    console.warn("Backend auth connection offline. Using local session fallback.", err);
  }

  return "";
}

const getHeaders = async (isFormData = false): Promise<HeadersInit> => {
  const token = await ensureAuthenticatedSession();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// 1. Health & Connection Check
export async function checkBackendHealth(): Promise<{ status: "connected" | "offline"; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/resume/`, {
      method: "GET",
      headers: await getHeaders(),
    });
    if (res.status === 200 || res.status === 401) {
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

  const token = await ensureAuthenticatedSession();
  const res = await fetch(`${API_BASE}/resume/upload/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.resume_file?.[0] || "Resume upload failed");
  }

  return res.json();
}

// 3. Process Resume with Multi-Agent Engine
export async function processResumeApi(resumeId: number): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ai/resume-process/${resumeId}/`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.details || "AI processing failed");
  }

  return res.json();
}

// 4. Retrieve Existing Processed Resume Results
export async function getResumeProcessResultApi(resumeId: number): Promise<any> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ai/resume-process/${resumeId}/`, {
    method: "GET",
    headers,
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ai/resume/${resumeId}/job-match/`, {
    method: "POST",
    headers,
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
  const headers = await getHeaders();
  const res = await fetch(
    `${API_BASE}/ai/resume/${resumeId}/job-match/${jobMatchId}/interview-plan/`,
    {
      method: "POST",
      headers,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate interview plan");
  }

  return res.json();
}

// 7. List User Resumes
export async function listUserResumesApi(): Promise<any[]> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/resume/`, {
    method: "GET",
    headers,
  });

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
  location: string = "Ahmedabad, India",
  workType: string = "All"
): Promise<{
  message: string;
  discovery_id: number;
  location_query: string;
  work_type: string;
  discovery_data: any;
}> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ai/resume/${resumeId}/job-finder/`, {
    method: "POST",
    headers,
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
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/ai/resume/${resumeId}/job-finder/`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to load discovered jobs");
  }

  return res.json();
}
