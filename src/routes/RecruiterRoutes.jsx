import React from "react";
import PrivateRoute from "./PrivateRoute";
import Layout from "./Layout";

import ReCandidatesSubmittion from "../pages/recruiter/CandidatesSubmittion";
import ReProfile from "../pages/recruiter/Profile";
import ReProgrammsView from "../pages/recruiter/ProgrammsView";
import ProgrammsDetail from "../pages/recruiter/ProgrammsDetail";

export const recruiterRoutes = [
  { path: "/recruiter/programmsview", element: <PrivateRoute role="recruiter"><Layout><ReProgrammsView /></Layout></PrivateRoute> },
  { path: "/recruiter/candidates-submittion", element: <PrivateRoute role="recruiter"><Layout><ReCandidatesSubmittion /></Layout></PrivateRoute> },
  { path: "/recruiter/profile", element: <PrivateRoute role="recruiter"><Layout><ReProfile /></Layout></PrivateRoute> },
  { path: "/recruiter/programmsdetail/:slug", element: <PrivateRoute role="recruiter"><Layout><ProgrammsDetail /></Layout></PrivateRoute> },
];
