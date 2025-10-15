import React from "react";
import PrivateRoute from "./PrivateRoute";
import Layout from "./Layout";

import AdOverView from "../pages/admin/Overview";
import AdCandidatesManagement from "../pages/admin/CandidatesManagement";
import AdProgrammsManagement from "../pages/admin/ProgrammsManagement";
import AdProfile from "../pages/admin/Profile";
import AdProgrammsDetail from "../pages/admin/ProgrammsDetail";

export const adminRoutes = [
  { path: "/admin/overview", element: <PrivateRoute role="admin"><Layout><AdOverView /></Layout></PrivateRoute> },
  { path: "/admin/candidates-management", element: <PrivateRoute role="admin"><Layout><AdCandidatesManagement /></Layout></PrivateRoute> },
  { path: "/admin/programms-management", element: <PrivateRoute role="admin"><Layout><AdProgrammsManagement /></Layout></PrivateRoute> },
  { path: "/admin/programmsdetail/:id", element: <PrivateRoute role="admin"><Layout><AdProgrammsDetail /></Layout></PrivateRoute> },
  { path: "/admin/profile", element: <PrivateRoute role="admin"><Layout><AdProfile /></Layout></PrivateRoute> },
];
