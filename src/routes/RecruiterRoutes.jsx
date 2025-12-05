import React from "react";
import PrivateRoute from "./PrivateRoutes";

import CandidatesTracker from "../page/candidates_tracker/CandidatesTracker";
import ReProfile from "../page/profile/Profile";
import ReProgrammsView from "../page/programms/all/AllPrograms";
import ProgrammsDetail from "../page/detail/program/Detail";

export const recruiterRoutes = [
  { path: "/recruiter/programmsview", element: <PrivateRoute role="recruiter"><ReProgrammsView /></PrivateRoute> },
  { path: "/recruiter/candidates-submittion", element: <PrivateRoute role="recruiter"><CandidatesTracker /></PrivateRoute> },
  { path: "/recruiter/profile", element: <PrivateRoute role="recruiter"><ReProfile /></PrivateRoute> },
  { path: "/recruiter/programmsdetail/:slug", element: <PrivateRoute role="recruiter"><ProgrammsDetail /></PrivateRoute> },
];
