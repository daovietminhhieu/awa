export const API_BASE = 'https://ctvbe.onrender.com';

// Session helpers for Authorization
function getSession() {
  try {
    const raw = sessionStorage.getItem("authSession");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getCurrentUser() {
  return getSession()?.user || null;
}

function authHeaders() {
  const token = getCurrentUser()?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}



