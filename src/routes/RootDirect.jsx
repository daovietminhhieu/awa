import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RootRedirect() {
  const { user, authReady } = useAuth();
  if (!authReady) return <div>Loading...</div>;

  if (!user) return <Navigate to="/home" />;
  if (user.role === "admin") return <Navigate to="/admin/overview" />;
  if (user.role === "recruiter") return <Navigate to="/recruiter/programmsview" />;
  if (user.role === "candidate") return <Navigate to="/candidate/home" />;

  return <Navigate to="/home" />;
}
