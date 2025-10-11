export const API_BASE = 'http://localhost:3000/alowork';

// Lấy toàn bộ session (user + token) từ sessionStorage
function getSession() {
  try {
    const raw = sessionStorage.getItem("authSession");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Lấy user hiện tại (không bao gồm token)
export function getCurrentUser() {
  return getSession()?.user || null;
}

// Lấy token JWT hiện tại
export function getToken() {
  return getSession()?.token || null;
}

// Tạo headers authorization nếu có token
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Đăng nhập và lưu session
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_BASE}/db/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Login failed');
  }

  // Lưu toàn bộ session (user + token)
  try {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const expiresAt = Date.now() + ONE_HOUR_MS;
    sessionStorage.setItem("authSession", JSON.stringify({ user: data.data, token: data.token, expiresAt }));
  } catch {}

  return data;
}

// Đăng xuất (xóa session)
export function logoutUser() {
  sessionStorage.removeItem("authSession");
}

// Đăng ký
export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/db/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Register failed');
  }

  return data;
}

// Lấy danh sách chương trình (programm)
export async function getProgrammsList() {
  const res = await fetch(`${API_BASE}/db/programm`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch programms list');
  }
  const data = await res.json();
  return data;
}


// Lấy thông tin programm bằng id
export async function getProgrammById(id) {
  const res = await fetch(`${API_BASE}/db/programm/${id}`, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  });
  if (!res.ok) {
    throw new Error('Failed to fetch programms by id');
  }
  const data = await res.json();
  return data;
}

// Request shared link to admin
export async function requestASharedLink(programmId) {
  const to = '68dd453474c74157fa7bc221';

  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  const res = await fetch(`${API_BASE}/user/referrals-request`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ admin: to, programm: programmId }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Request failed:', res.status, text);
    throw new Error('Failed to request shared link to admin');
  }

  const data = await res.json();
  return data;
}

// Lấy list referral
export async function getReferralsList() {

  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  const res = await fetch(`${API_BASE}/user/my-referrals`, {
    method: 'GET',
    headers,
  })
  
  if (!res.ok) {
    throw new Error('Failed to get referrals list');
  }

  const data = await res.json();
  return data;
}

// Cập nhật referral status
export async function updateReferralStatus(referralId, newStatus) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  try {
    const res = await fetch(`${API_BASE}/user/referrals/${referralId}/${newStatus}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({})
    });

    console.log(res);
    const data = await res.json(); // luôn parse JSON (kể cả khi lỗi)
    console.log(data);
    if (!res.ok) {
      // Nếu server trả message rõ ràng
      const errorMessage = data?.message || 'Cập nhật trạng thái thất bại';
      throw new Error(errorMessage);
    }

    return data;

  } catch (err) {
    console.error("❌ API Error:", err.message);
    throw err; // ném lại để component xử lý (alert/toast)
  }
}


// Cập nhật referral steps
export async function updateReferralSteps(referralId, newStep, stepNumber) {
  const headers = { 'Content-Type': 'application/json', ...authHeaders() };
  console.log(headers);
  let endpoint;
  if (newStep === "completed" || newStep === "rejected") {
    // Admin step approval/rejection
    endpoint = `${API_BASE}/user/referrals/${referralId}/steps/${stepNumber}/${newStep}`;
  } else if (newStep === "in_review") {
    // Recruiter requests review
    endpoint = `${API_BASE}/user/referrals/${referralId}/steps/${stepNumber}/request`;
  } else {
    throw new Error(`Unsupported step update action: ${newStep}`);
  }

  const res = await fetch(endpoint, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Step update failed:', text);
    throw new Error(`Failed to update step: ${res.status}`);
  }

  return await res.json();
}

// Lấy link referral
export async function getLinkFromReferralById(id) {

  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  const res = await fetch(`${API_BASE}/user/referrals-link/${id}`, {
    method: 'GET',
    headers,
  });
  if(!res.ok) {
    throw new Error('Failed get link');
  }
  const data = await res.json();
  return data;
}

export async function deleteProgrammsById(id) {

  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  const res = await fetch(`${API_BASE}/user/programm/delete/${id} `, {
    method: 'DELETE',
    headers,  
  })

  if(!res.ok) {
    throw new Error('Failed delete programm by id');
  }
  const data = await res.json();
  return data;
  
}

export async function editProgrammsById(id, updates) {

  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  const res = await fetch(`${API_BASE}/user/programm/edit/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates)
  })

  if(!res.ok) throw new Error('Failed edit Programms');
  return await res.json();
}

export async function addNewProgramm(programm) {

  const headers = { 'Content-Type': 'application/json', ...authHeaders() };

  const res = await fetch(`${API_BASE}/user/programm/new`, {
    method: 'POST',
    headers,
    body: JSON.stringify(programm)
  })

  if(!res.ok) throw new Error('Failed add new programm');

  return await res.json();
}

export async function loadProgrammForCandidateExternSystemById(id) {
  const res = await fetch(`${API_BASE}/db/programm/c/${id}`, {
    method: 'GET',
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMessage = data?.message || 'Load programm from referral id failed';
    throw new Error(errorMessage);
  }
  return data;
}

export async function sendFilledInformationsForm(id, form) {
  try {
    const response = await fetch(`${API_BASE}/db/programm/c/${id}/fill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // <-- QUAN TRỌNG
      },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.warn("Fill form failed:", result?.message);
    }

    return result;
  } catch (error) {
    console.error("Submission error:", error);
    throw new Error("Failed to submit application form");
  }
}

export async function getSavedProgramms() {
  try {
    const headers = {'Content-Type': 'application/json', ...authHeaders()};

    const response = await fetch(`${API_BASE}/user/saved-programms`, {
      method: "GET",
      headers,
    })

    if(!response.ok) console.warn("Get saved programms response is not ok");
    return await response.json();

  } catch(err) {
    throw new Error("Failed to get saved programms", err);
  }
}

export async function saveProgrammById(progId) {
  try {
    const headers = {'Content-Type': 'application/json', ...authHeaders()};

    const response = await fetch(`${API_BASE}/user/save-programm`, {
      method: "POST",
      headers,
      body: JSON.stringify({ programmId: progId }),
    })

    if(!response.ok) console.warn("Save programm response is not ok");
    return await response.json();

  } catch(err) {
    throw new Error("Failed to save programm id " + progId);
  }
}

export async function unsaveProgrammById(progId) {
  try {
    const headers = {'Content-Type': 'application/json', ...authHeaders()};

    const response = await fetch(`${API_BASE}/user/unsave-programm`, {
      method: "POST",
      headers,
      body: JSON.stringify({ programmId: progId }),
    })

    if(!response.ok) console.warn("Save programm response is not ok");
    console.log("Successfully unsave programm");
    return await response.json();

  } catch(err) {
    throw new Error("Failed to save programm id " + progId);
  }
}

export async function getPotentialsList(isAdmin) {
  try {
    const headers = {'Content-Type': 'application/json', ...authHeaders()};
    let endpoint = ""
    
    if(isAdmin) endpoint = `${API_BASE}/user/potentials`;
    else endpoint = `${API_BASE}/user/my-potentials`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers
    })

    if(!response.ok) console.warn("Get potentials list response is not ok");
    return await response.json();
  } catch(err) {
    throw new Error("Failed to get potentials list "+ err);
  }
}

export async function pauseOrunpauseProgramm(id, action) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
    };

    const response = await fetch(`${API_BASE}/user/pause-unpause-programm`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id, action }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Pause/unpause failed");
    }

    return data; // ✅ { success: true, data: { id, is_active } }
  } catch (err) {
    console.error("pauseOrunpauseProgramm error:", err);
    throw new Error("Failed to do pause/unpause action");
  }
}

