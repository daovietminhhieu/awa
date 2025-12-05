import React from "react";
import PrivateRoute from "./PrivateRoutes";

import AdOverView from "../page/overview/Overview";
import AdCandidatesManagement from "../page/candidates_tracker/CandidatesTracker";
import AdProgrammsManagement from "../page/programms/all/AllPrograms";
import AdProfile from "../page/profile/Profile";
import AdProgrammsDetail from "../page/detail/program/Detail";

export const adminRoutes = [
  { path: "/admin/overview", element: <PrivateRoute role="admin"><AdOverView /></PrivateRoute> },
  { path: "/admin/candidates-management", element: <PrivateRoute role="admin"><AdCandidatesManagement /></PrivateRoute> },
  { path: "/admin/programms-management", element: <PrivateRoute role="admin"><AdProgrammsManagement /></PrivateRoute> },
  { path: "/admin/programmsdetail/:slug", element: <PrivateRoute role="admin"><AdProgrammsDetail /></PrivateRoute> },
  { path: "/admin/profile", element: <PrivateRoute role="admin"><AdProfile /></PrivateRoute> },
];
