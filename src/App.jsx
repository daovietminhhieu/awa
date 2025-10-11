import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { I18nProvider } from "./i18n";

// Admins import
import AdOverView from "./pages/admin/Overview";
import AdCandidatesManagement from "./pages/admin/CandidatesManagement";
import AdProgrammsManagement from "./pages/admin/ProgrammsManagement";
import AdProfile from "./pages/admin/Profile";
import AdProgrammsDetail from "./pages/admin/ProgrammsDetail";

// Recruiters import
import ReCandidatesSubmittion from "./pages/recruiter/CandidatesSubmittion";
import ReProfile from "./pages/recruiter/Profile";
import ReProgrammsView from "./pages/recruiter/ProgrammsView";
import ProgrammsDetail from "./pages/recruiter/ProgrammsDetail";

// Candidates import
import CaHome from "./pages/candidates/Home";
import CaJobsView from "./pages/candidates/JobsView";
import CaProfile from "./pages/candidates/Profile";

import Detail from "./pages/Detail";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Navbar from "./pages/NavBar";

import HomePage from "./pages/Home";
import CandidateExternSystemApply from "./pages/CandidateExternSystemApply";
import { DetailSuccessStory, EventDetail, PartnerDetail, TipDetail } from "./components/Short";



// Layout wrapper để chứa Navbar + nội dung
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// Route riêng kiểm tra đăng nhập và phân quyền
// App.jsx
function PrivateRoute({ children, role }) {
  const { user, authReady } = useAuth();

  if (!authReady) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const userRole = user?.role;
  if (role && userRole !== role) {
    return <Navigate to="/login" />;
  }
  return children;
}


function RootRedirect() {
  const { user, authReady } = useAuth();
  if (!authReady) return <div>Loading...</div>;
  if (!user) return <Navigate to="/home" />;

  if (user.role === "admin") return <Navigate to="/admin/overview" />;
  if (user.role === "recruiter") return <Navigate to="/recruiter/programmsview" />;
  if (user.role === "candidate") return <Navigate to="/candidate/home" />;

  return <Navigate to="/home" />;
}


// App chính
export default function App() {
  const basename = (import.meta?.env?.BASE_URL || "/").replace(/\/$/, "");

  return (
    <Router basename={basename}>
      <I18nProvider>
        <AuthProvider>
        <Routes>
          {/* Redirect root → dashboard hoặc home */}
          <Route path="/" element={<RootRedirect />} />

          {/* Các trang công khai */}
          <Route path="/home" element={<Layout>
            <HomePage />
          </Layout>} />
          <Route path="/programm/:id" element={<Layout>
            <Detail />
          </Layout>} />
          <Route path="/login" element={<Layout>
            <Login />
          </Layout>} />
          <Route path="/signup" element={<Layout>
            <SignUp />
          </Layout>} />
          <Route path="programm-view/candidate-apply/:id" element={<Layout>
            <CandidateExternSystemApply />
          </Layout>} />
          <Route path="success-story-detail/:id" element={<Layout>
            <DetailSuccessStory />
          </Layout>}/>
          <Route path="/tip-detail/:tipId" element={<Layout><TipDetail /></Layout>} />
          <Route path="/event-detail/:eventId" element={<Layout><EventDetail /></Layout>} />
          <Route path="/collabor" element={<Layout><PartnerDetail/></Layout>} />

          {/* Admin router */}
          <Route
            path="/admin/overview"
            element={
              <PrivateRoute role="admin">
                <Layout><AdOverView /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/candidates-management"
            element={
              <PrivateRoute role="admin">
                <Layout><AdCandidatesManagement /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/programms-management"
            element={
              <PrivateRoute role="admin">
                <Layout><AdProgrammsManagement /></Layout>
              </PrivateRoute>
            }          
          />
          <Route
            path="/admin/programmsdetail/:id"
            element={
              <PrivateRoute role="admin">
                <Layout><AdProgrammsDetail /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <PrivateRoute role="admin">
                <Layout><AdProfile /></Layout>
              </PrivateRoute>
            }          
          />
            
          {/* Recruiter router */}
          <Route
            path="/recruiter/programmsview"
            element={
              <PrivateRoute role="recruiter">
                <Layout><ReProgrammsView /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recruiter/candidates-submittion"
            element={
              <PrivateRoute role="recruiter">
                <Layout><ReCandidatesSubmittion /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recruiter/profile"
            element={
              <PrivateRoute role="recruiter">
                <Layout><ReProfile /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/recruiter/programmsdetail/:id"
            element={
              <PrivateRoute role="recruiter">
                <Layout><ProgrammsDetail /></Layout>
              </PrivateRoute>
            }
          />

          {/* Candidates router */}
          <Route
            path="/candidate/home"
            element={
              <PrivateRoute role="candidate">
                <Layout><CaHome /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/candidate/jobs-view"
            element={
              <PrivateRoute role="candidate">
                <Layout><CaJobsView /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/candidate/profile"
            element={
              <PrivateRoute role="candidate">
                <Layout><CaProfile /></Layout>
              </PrivateRoute>
            }
          />

          {/* Redirect tất cả các path lạ về / */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
      </I18nProvider>
    </Router>
  );
}
