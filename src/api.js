// ====================== CONFIG ======================
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/alowork";


console.log("🌐 Using API base:", API_BASE);



// ====================== SESSION HANDLING ======================
function getSession() {
  try {
    const raw = sessionStorage.getItem("awa-ss");
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
  if (!res.ok || !data.success) {
     alert(data.message);
  }

  const ONE_HOUR_MS = 60 * 60 * 1000;
  const expiresAt = Date.now() + ONE_HOUR_MS;
  sessionStorage.setItem(
    "awa-ss",
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
  if (!res.ok) throw new Error("No programm found");
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
  const headers = { "Content-Type": "application/json", ...authHeaders() };
  const res = await fetch(`${API_BASE}/user/my-referrals`, {
    headers,
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
  console.log("🔗 API URL:", `${API_BASE}/user/referrals/${referralId}/${newStatus}`);
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

export async function createPost(data) {

  try {
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
    };

    const response = await fetch(`${API_BASE}/user/`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create new post");
    }

    return result; // { success: true, message: "...", data: { user } }
  } catch(err) {
    console.error("❌ create new Post failed:", err.message);
    throw err;
  }
}

export async function getPosts() {
  const res = await fetch(`${API_BASE}/user/posts`);
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.message);
  return result;
}

export async function getPostsByType(type) {
  const res = await fetch(`${API_BASE}/user/post?type=${encodeURIComponent(type)}`, {
    headers: { "Content-Type": "application/json" },
  });

  const result = await res.json();

  // Kiểm tra status HTTP và response body success flag
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch posts by type");
  }

  return result; // Trả về toàn bộ object (có .data)
}

// ====================== FILE UPLOAD ======================

/**
 * Upload một file lên Supabase thông qua backend
 * @param {File} file - File cần upload (từ input type="file")
 * @returns {Promise<string>} URL public của file
 */
export async function upFileToStorage(file) {
  if (!file) throw new Error("No file provided");

  // FormData chứa file
  const formData = new FormData();
  formData.append("file", file);

  // Gọi API upload
  const res = await fetch(`${API_BASE}/db/upload`, {
    method: "POST",
    headers: {
      ...authHeaders(), // nếu cần xác thực token
      // ❌ KHÔNG thêm Content-Type, fetch sẽ tự set multipart boundary
    },
    body: formData,
  });

  const data = await res.json();
  console.log(data);
  if (!res.ok || !data.success) {
    console.error("❌ Upload failed:", data);
    throw new Error(data.message || "Failed to upload file");
  }

  // Backend nên trả về: { success: true, file_url: "https://..." }
  return data.publicUrl;
}

export async function updatePost(id, updates) {
    const headers = {
      'Content-Type': 'application/json',
      ...authHeaders(),
    };

    const res = await fetch(`${API_BASE}/user/update/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),  
    });
    const data = await res.json();
    if(!res.ok || !data.success) {
      throw new Error(data.message || "Failed to update Post");
    }
    
    return data;    
}

export async function removePost(id) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders()
  }

  const res = await fetch(`${API_BASE}/user/remove/${id}`, {
    method: "DELETE",
    headers
  });
  const data = await res.json();
  if(!res.ok || !data.success) {
    throw new Error(data.message || "Failed to remove Post");
  }
  return data;

}

export async function sendProgrammReview(programmId, reviewData) {
  try {
    const res = await fetch(`${API_BASE}/user/programm/${programmId}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to add review");
    return data;
  } catch (err) {
    console.error("❌ sendProgrammReview failed:", err);
    throw err;
  }
}
