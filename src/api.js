// ====================== CONFIG ======================
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000";


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

export async function loginL({ email, password }) {
  const res = await fetch(`${API_BASE}/local/system/login`, {
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

export async function signupL({ name, email, password, role }) {
  const res = await fetch(`${API_BASE}/local/system/register`, {
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
export async function getProgramsList() {
  const res = await fetch(`${API_BASE}/local/programs`);
  if (!res.ok) throw new Error("Failed to fetch programms list");
  return await res.json();
}

// Lấy programm bằng slug (thay thế cho getProgrammById)
export const getProgrammBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE}/local/program/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching programm by slug:", error);
    throw error;
  }
};

export async function getProgrammById(id) {
  const res = await fetch(`${API_BASE}/local/program/id/${id}`);
  if (!res.ok) throw new Error("No programm found");
  return await res.json();
}

export async function deleteProgrammsById(id) {
  const res = await fetch(`${API_BASE}/local/program/${id}`, {
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
  const res = await fetch(`${API_BASE}/local/new-program`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(programm),
  });
  if (!res.ok) throw new Error("Failed to add new programm");
  return await res.json();
}

// ====================== REFERRAL ======================
export async function requestASharedLink(programmId, recruiterId) {
  const res = await fetch(`${API_BASE}/local/new-referral`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ progId: programmId, recruiterId: recruiterId }),
  });
  if (!res.ok) throw new Error("Failed to request shared link");
  return await res.json();
}

export async function getReferralsList() {
  const headers = { "Content-Type": "application/json", ...authHeaders() };
  const res = await fetch(`${API_BASE}/local/referrals`, {
    headers,
  });
  if (!res.ok) throw new Error("Failed to get referrals list");
  return await res.json();
}

export async function getReferralsListForUserById(id) {
  const headers = { "Content-Type": "application/json", ...authHeaders() };
  const res =  await fetch(`${API_BASE}/local/referral/for-user-by-id/${id}`, {headers});
  if(!res.ok) throw new Error("Failed to get referrals list for users by id");
  return await res.json();
}

export async function updateReferralStatus(referralId, newStatus) {
  const res = await fetch(`${API_BASE}/local/referral/update/${referralId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
     body: JSON.stringify({ status: newStatus })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update referral");
  return data;
}

export async function updateReferralSteps(referralId, newStatus, stepNumber) {
  const res = await fetch(
    `${API_BASE}/local/referral/update-step/${referralId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        step: stepNumber,
        status: newStatus
      })
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update step");
  return data;
}


export async function getLinkFromReferralById(id) {
  const res = await fetch(`${API_BASE}/local/referral/link/${id}`, {
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

import axios from "axios";

export const sendFilledInformationsForm = (progId, data) => {
  return axios
    .put(`${API_BASE}/local/user/apply-form/${progId}`, data)
    .then(res => res.data);
};

/**
 * ⚠️ KHÔNG set headers Content-Type
 * Axios sẽ tự set multipart/form-data
 */


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


export async function updateBasicInfo(userId, data) {
  try {
    const headers = {
      "Content-Type":"application/json",
    };

    const response = await fetch(`${API_BASE}/local/user/update-profile/${userId}`, {
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

export const getUsersByIds = async (ids = []) => {
  return Promise.all(
    ids.map(id =>
      getMyProfile(id).catch(() => null)
    )
  ).then(r => r.filter(Boolean));
};

export const getProgramsByIds = async (ids = []) => {
  return Promise.all(
    ids.map(id =>
      getProgrammById(id).catch(() => null)
    )
  ).then(r => r.filter(Boolean));
};

export async function getMyProfile(id) {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
    };

    const response = await fetch(`${API_BASE}/local/user/${id}`, {
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

export async function createPostL(data) {
  try {
    const headers = {
      "Content-Type": "application/json",
      // ...authHeaders(),
    };
    const response = await fetch(`${API_BASE}/local/new-post`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create new post");
    }
    return result; // { success: true, message: "...", data: { user } }
  } catch (err) {
    console.error("❌ create new Post failed:", err.message);
    throw err;
  }
}

export async function updatePostL(id, updates) {
    const headers = {
      'Content-Type': 'application/json',
      // ...authHeaders(),
    };
    const res = await fetch(`${API_BASE}/local/post/${id}`, {
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

export async function removePostL(id) {
  const headers = {
    'Content-Type': 'application/json',
    // ...authHeaders()
  }
  const res = await fetch(`${API_BASE}/local/post/${id}`, {
    method: "DELETE",
    headers
  });
  const data = await res.json();
  if(!res.ok || !data.success) {
    throw new Error(data.message || "Failed to remove Post");
  }
  return data;
}

export async function createPost(data) {

  try {
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
    };
    console.log(headers);
    const response = await fetch(`${API_BASE}/user/post`, {
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

// Assuming you have an API_BASE constant defined somewhere in your code that points to the server base URL.
export async function getPostById(id) {
  try {
    const res = await fetch(`${API_BASE}/local/post/${id}`, {
      method: "GET", // Method type, GET is used to fetch data
      headers: {
        "Content-Type": "application/json", // Content type as JSON
        ...authHeaders()
      },
    });

    const result = await res.json(); // Parse the response body as JSON

    if (!res.ok || !result.success) {
      // If the response is not OK or the success flag is false, throw an error
      throw new Error(result.message || "Failed to fetch post");
    }

    // Return the fetched post data
    return result;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

// Lấy danh sách posts
export async function getPostsList() {
  const res = await fetch(`${API_BASE}/local/posts`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Error fetching posts: ${res.statusText}`);
  return await res.json();
}

// Xóa post theo id
export async function deletePostById(id) {
  const res = await fetch(`${API_BASE}/user/posts/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) throw new Error(`Error deleting post: ${res.statusText}`);
  return await res.json();
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

export async function getPostBySlugL(slug) {
  try {
    const response = await fetch(`${API_BASE}/local/posts/slug/${slug}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw error;
  }   
};

export async function getPostsByTypeL(type) {
  const res = await fetch(`${API_BASE}/local/posts?type=${encodeURIComponent(type)}`, {
    headers: { "Content-Type": "application/json" },
  });
  const result = await res.json();

  // Kiểm tra status HTTP và response body success flag
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch posts by type");
  }
  return result; // Trả về toàn bộ object (có .data)
}

export async function getPostsListL() {
  const res = await fetch(`${API_BASE}/local/posts`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Error fetching posts: ${res.statusText}`);
  return await res.json();
}

export async function getPostBySlug(slug) {
  try {
    const response = await fetch(`${API_BASE}/local/post/slug/${slug}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw error;
  }
};

// ====================== FILE UPLOAD ======================

/**
 * Upload một file lên Supabase thông qua backend
 * @param {File} file - File cần upload (từ input type="file")
 * @returns {Promise<string>} URL public của file
 */
export async function upFileToStorage(file) {
  if (!file) throw new Error("No file provided");
  console.log("API_BASE =", API_BASE);

  // FormData chứa file
  const formData = new FormData();
  formData.append("file", file);

  // Gọi API upload
  const res = await fetch(`${API_BASE}/local/system/upload`, {
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

export async function upFileToStorage1(file) {
  if (!file) throw new Error("No file provided");

  // FormData chứa file
  const formData = new FormData();
  formData.append("file", file);

  // Gọi API upload
  const res = await fetch(`${API_BASE}/db/upload1`, {
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

    const res = await fetch(`${API_BASE}/user/post/update/${id}`, {
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

  const res = await fetch(`${API_BASE}/user/post/remove/${id}`, {
    method: "DELETE",
    headers
  });
  const data = await res.json();
  if(!res.ok || !data.success) {
    throw new Error(data.message || "Failed to remove Post");
  }
  return data;

}

export async function updateProgram(id, updates) {
  const res = await fetch(`${API_BASE}/local/program/update/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update program");
  }

  return await res.json();
}

export async function sendProgrammReview(programmId, reviewData) {
  try {
    const res = await fetch(`${API_BASE}/local/user/send-review/${programmId}`, {
      method: "POST",
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

/* =======================
   GỬI Q&A CHO PROGRAMM
======================= */
export async function sendProgrammQA(programmId, payload) {
  try {
    const res = await fetch(`${API_BASE}/local/user/send-question/${programmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to send QA");
    return data; // { success: true, data: ... }
  } catch (err) {
    console.error("❌ sendProgrammQA error:", err);
    return { success: false, message: err.message };
  }
}

export async function answerProgrammQA(programmId, payload) {
  try {
    const res = await fetch(`${API_BASE}/local/user/send-answer/${programmId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to send QA");
    return data; // { success: true, data: ... }
  } catch (err) {
    console.error("❌ sendProgrammQA error:", err);
    return { success: false, message: err.message };
  }
}


/* =======================
   LẤY DANH SÁCH Q&A
======================= */
export async function getProgrammQAList(programmId) {
  try {
    const res = await fetch(`${API_BASE}/local/user/${programmId}/qaList`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch QA list");
    return data; // { success: true, data: [...] }
  } catch (err) {
    console.error("❌ getProgrammQAList error:", err);
    return { success: false, message: err.message };
  }
}



export async function getProgrammCosts(programmId) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/costs`, {
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) {
    console.error("Failed to load cost table");
    return null;
  }
  return await res.json(); // array
}


export async function addProgrammCost(programmId, costData) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/costs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(costData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add cost");
  return data;
}


export async function updateProgrammCost(programmId, costId, updates) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/costs/${costId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update cost");
  return data;
}


export async function deleteProgrammCost(programmId, costId) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/costs/${costId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete cost");
  return data;
}


export async function getProgrammDocuments(programmId) {
  try {
    const res = await fetch(`${API_BASE}/user/programm/${programmId}/documents`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      console.error("Failed to load documents list");
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Network error while loading documents:", error);
    return null;
  }
}



export async function addProgrammDocument(programmId, docData) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(docData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add document");
  return data;
}


export async function updateProgrammDocument(programmId, docId, updates) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/documents/${docId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update document");
  return data;
}


export async function deleteProgrammDocument(programmId, docId) {
  const res = await fetch(`${API_BASE}/user/programm/${programmId}/documents/${docId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete document");
  return data;
}


// --- Get all steps of a programm
export async function getProgrammSteps(programmId) {
  try {
    const res = await fetch(`${API_BASE}/user/programm/${programmId}/steps`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch steps");
    return data;
  } catch (err) {
    console.error("getProgrammSteps error:", err);
    throw err;
  }
}

// --- Add a step
export async function addProgrammStep(programmId, stepData) {
  try {
    const res = await fetch(`${API_BASE}/user/programm/${programmId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(stepData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add step");
    return data;
  } catch (err) {
    console.error("addProgrammStep error:", err);
    throw err;
  }
}

// --- Update a step
export async function updateProgrammStep(programmId, stepId, updates) {
  try {
    const res = await fetch(`${API_BASE}/user/programm/${programmId}/steps/${stepId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update step");
    return data;
  } catch (err) {
    console.error("updateProgrammStep error:", err);
    throw err;
  }
}

// --- Delete a step
export async function deleteProgrammStep(programmId, stepId) {
  try {
    const res = await fetch(`${API_BASE}/user/programm/${programmId}/steps/${stepId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete step");
    return data;
  } catch (err) {
    console.error("deleteProgrammStep error:", err);
    throw err;
  }
}

// --- Get referral by slug
export async function getReferralBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/user/referrals/${slug}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch referral");
    return data.referral;
  } catch (err) {
    console.error("getReferralBySlug error:", err);
    throw err;
  }
}
export async function getReferralById(id) {
  try {
    const res = await fetch(`${API_BASE}/local/referral/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch referral by id");
    return data;
  }
  catch (err) {
    console.error("getReferralById error:", err);
    throw err;
  }
}
export async function deleteSharedProgramsById(id) {
  try {
    const res = await fetch(`${API_BASE}/local/referral/delete/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete shared programm");
    return data;
  } catch (err) {
    console.error("deleteSharedProgramsById error:", err);
    throw err;
  }
}
export async function getReferralLinkById(id) {
  try {
    const res = await fetch(`${API_BASE}/local/referral/link/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to get referral link");
    return data.link;
  } catch (err) {
    console.error("getReferralLinkById error:", err);
    throw err;
  }
}