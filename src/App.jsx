import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./i18n";

import RootRedirect from "./routes/RootDirect";
import Layout from "./routes/Layout";
import { publicRoutes } from "./routes/PublicRoutes";
import { adminRoutes } from "./routes/AdminRoutes";
import { recruiterRoutes } from "./routes/RecruiterRoutes";
import { candidateRoutes } from "./routes/CandidateRoutes";

export default function App() {
  return (
    <Router>
      <I18nProvider>
        <AuthProvider>
          <Routes>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Layout */}
            <Route path="/" element={<Layout />}>
              {publicRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}

              {adminRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}

              {recruiterRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}

              {candidateRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Route>

            {/* 404 */}
            <Route path="*" element={<div>404</div>} />

          </Routes>


        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}

