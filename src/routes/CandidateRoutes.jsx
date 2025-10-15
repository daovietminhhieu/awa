import React from "react";
import PrivateRoute from "./PrivateRoute";
import Layout from "./Layout";

import CaHome from "../pages/candidates/Home";
import CaJobsView from "../pages/candidates/JobsView";
import CaProfile from "../pages/candidates/Profile";

export const candidateRoutes = [
  { path: "/candidate/home", element: <PrivateRoute role="candidate"><Layout><CaHome /></Layout></PrivateRoute> },
  { path: "/candidate/jobs-view", element: <PrivateRoute role="candidate"><Layout><CaJobsView /></Layout></PrivateRoute> },
  { path: "/candidate/profile", element: <PrivateRoute role="candidate"><Layout><CaProfile /></Layout></PrivateRoute> },
];
