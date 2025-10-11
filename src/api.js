// ====================== CONFIG ======================
export const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:3000/alowork";

console.log("🌐 Using API base:", API_BASE);

// ====================== SESSION HANDLING ======================
function getSession() {
  try {
    const raw = sessionStorage.getItem("authSession");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  return getSession()?.user || null;
}

export function getToken() {
  return getSession()?.token || null;
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ====================== AUTH ======================
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/db/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Login failed");

  const ONE_HOUR_MS = 60 * 60 * 1000;
  const expiresAt = Date.now() + ONE_HOUR_MS;
  sessionStorage.setItem(
    "authSession",
    JSON.stringify({ user: data.data, token: data.token, expiresAt })
  );

  return data;
}

export function logoutUser() {
  sessionStorage.removeItem("authSession");
}

export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/db/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Register failed");
  return data;
}

// ====================== PROGRAMM ======================
export async function getProgrammsList() {
  const res = await fetch(`${API_BASE}/db/programm`);
  if (!res.ok) throw new Error("Failed to fetch programms list");
  return await res.json();
}

export async function getProgrammById(id) {
  const res = await fetch(`${API_BASE}/db/programm/${id}`);
  if (!res.ok) throw new Error("Failed to fetch programm by id");
  return await res.json();
}

export async function deleteProgrammsById(id) {
  const res = await fetch(`${API_BASE}/user/programm/delete/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to delete programm");
  return await res.json();
}

export async function editProgrammsById(id, updates) {
  const res = await fetch(`${API_BASE}/user/programm/edit/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to edit programm");
  return await res.json();
}

export async function addNewProgramm(programm) {
  const res = await fetch(`${API_BASE}/user/programm/new`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(programm),
  });
  if (!res.ok) throw new Error("Failed to add new programm");
  return await res.json();
}

export async function restartProgramms() {
  const res = await fetch(`${API_BASE}/db/programm/restart/all`, {
    method: "DELETE",
  });
  return await res.json();
}

export async function restartUsers() {
  const res = await fetch(`${API_BASE}/db/user/restart/all`, {
    method: "DELETE",
  });
  return await res.json();
}

// ====================== REFERRAL ======================
export async function requestASharedLink(programmId) {
  const to = "68dd453474c74157fa7bc221";
  const res = await fetch(`${API_BASE}/user/referrals-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ admin: to, programm: programmId }),
  });
  if (!res.ok) throw new Error("Failed to request shared link");
  return await res.json();
}

export async function getReferralsList() {
  const res = await fetch(`${API_BASE}/user/my-referrals`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to get referrals list");
  return await res.json();
}

export async function updateReferralStatus(referralId, newStatus) {
  const res = await fetch(`${API_BASE}/user/referrals/${referralId}/${newStatus}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update referral");
  return data;
}

export async function updateReferralSteps(referralId, newStep, stepNumber) {
  const headers = { "Content-Type": "application/json", ...authHeaders() };
  let endpoint;

  if (newStep === "completed" || newStep === "rejected") {
    endpoint = `${API_BASE}/user/referrals/${referralId}/steps/${stepNumber}/${newStep}`;
  } else if (newStep === "in_review") {
    endpoint = `${API_BASE}/user/referrals/${referralId}/steps/${stepNumber}/request`;
  } else {
    throw new Error(`Unsupported step update action: ${newStep}`);
  }

  const res = await fetch(endpoint, { method: "PATCH", headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update step");
  return data;
}

export async function getLinkFromReferralById(id) {
  const res = await fetch(`${API_BASE}/user/referrals-link/${id}`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error("Failed to get referral link");
  return await res.json();
}

// ====================== CANDIDATE ======================
export async function loadProgrammForCandidateExternSystemById(id) {
  const res = await fetch(`${API_BASE}/db/programm/c/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to load programm");
  return data;
}

export async function sendFilledInformationsForm(id, form) {
  const res = await fetch(`${API_BASE}/db/programm/c/${id}/fill`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to submit form");
  return data;
}

// ====================== SAVED PROGRAMMS ======================
export async function getSavedProgramms() {
  const res = await fetch(`${API_BASE}/user/saved-programms`, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return await res.json();
}

export async function saveProgrammById(progId) {
  const res = await fetch(`${API_BASE}/user/save-programm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ programmId: progId }),
  });
  return await res.json();
}

export async function unsaveProgrammById(progId) {
  const res = await fetch(`${API_BASE}/user/unsave-programm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ programmId: progId }),
  });
  return await res.json();
}

// ====================== POTENTIALS ======================
export async function getPotentialsList(isAdmin) {
  const endpoint = isAdmin
    ? `${API_BASE}/user/potentials`
    : `${API_BASE}/user/my-potentials`;

  const res = await fetch(endpoint, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return await res.json();
}

export async function pauseOrunpauseProgramm(id, action) {
  const res = await fetch(`${API_BASE}/user/pause-unpause-programm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ id, action }),
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Pause/unpause failed");
  return data;
}


export async function updateBasicInfo(data) {
  try {
    const headers = {
      "Content-Type":"application/json",
      ...authHeaders(),
    };

    const response = await fetch(`${API_BASE}/user/myprofile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    })

    const result = await response.json();

    if(!response.ok || !result.success) {
      throw new Error(result.message || "Update profile failed");
    }

    return result;
  } catch (err) {
    console.error("❌ Update profile failed:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
}


export async function getMyProfile() {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
    };

    const response = await fetch(`${API_BASE}/user/myprofile`, {
      method: "GET",
      headers,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to fetch profile");
    }

    return result; // { success: true, message: "...", data: { user } }
  } catch (err) {
    console.error("❌ getMyProfile failed:", err.message);
    throw err;
  }
}
