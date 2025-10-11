// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
const LS_SESSION = "authSession"; // stored in sessionStorage to isolate per tab
const ONE_HOUR_MS = 60 * 60 * 1000;

// =========================
// 🔹 Helpers
// =========================
function readSession() {
  try {
    const raw = sessionStorage.getItem(LS_SESSION);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !data.expiresAt) return null;
    if (Date.now() > data.expiresAt) return null;
    return data;
  } catch {
    return null;
  }
}

function writeSession(user, token) {
  try {
    const data = { user, token, expiresAt: Date.now() + ONE_HOUR_MS };
    sessionStorage.setItem(LS_SESSION, JSON.stringify(data));
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(LS_SESSION);
  } catch {}
}

// =========================
// 🔹 Auth Provider
// =========================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const navigate = useNavigate();

  // restore session on mount
  useEffect(() => {
    const s = readSession();
    if (s?.user) {
      setUser(s.user);
    }
    setAuthReady(true);
  }, []);

  // auto-logout when expired (check every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const s = readSession();
      if (!s?.user) {
        if (user) {
          setUser(null);
          navigate("/login");
        }
        return;
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  // =========================
  // 🔹 LOGIN
  // =========================
  const login = (nextUser, token) => {
    setUser(nextUser);
    writeSession(nextUser, token);

    if (nextUser.role === "admin") navigate("/admin/overview");
    else if (nextUser.role === "recruiter") navigate("/recruiter/programmsview");
    else if (nextUser.role === "candidate") navigate("/candidate/home");
    else navigate("/home");
  };

  // =========================
  // 🔹 LOGOUT
  // =========================
  const logout = () => {
    setUser(null);
    clearSession();
    navigate("/login");
  };

  // =========================
  // 🔹 UPDATE SESSION  ✅ NEW
  // =========================
  const updateSession = (updatedUser, newToken = null) => {
    try {
      const existing = readSession();
      const tokenToUse = newToken || existing?.token;
      if (!tokenToUse) {
        console.warn("⚠️ No token available to update session");
        return;
      }

      // cập nhật state và sessionStorage
      const newSession = {
        user: updatedUser,
        token: tokenToUse,
        expiresAt: Date.now() + ONE_HOUR_MS,
      };

      sessionStorage.setItem(LS_SESSION, JSON.stringify(newSession));
      setUser(updatedUser);
    } catch (err) {
      console.error("❌ Failed to update session:", err);
    }
  };

  const value = useMemo(
    () => ({ user, authReady, login, logout, setUser, updateSession }),
    [user, authReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
