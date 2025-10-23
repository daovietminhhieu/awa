import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { I18nProvider } from "./i18n";

import RootRedirect from "./routes/RootDirect";
import { publicRoutes } from "./routes/PublicRoutes";
import { adminRoutes } from "./routes/AdminRoutes";
import { recruiterRoutes } from "./routes/RecruiterRoutes";
import { candidateRoutes } from "./routes/CandidateRoutes";

export default function App() {
  const basename = "/";


  return (
    <Router basename={basename}>
      <I18nProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            {[...publicRoutes, ...adminRoutes, ...recruiterRoutes, ...candidateRoutes].map(
              ({ path, element }) => <Route key={path} path={path} element={element} />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}
