import React from "react";
import PrivateRoute from "./PrivateRoutes";

import CaHome from "../page/home/Home";
import CaJobsView from "../page/programms/Programms";
import CaProfile from "../page/profile/Profile";

export const candidateRoutes = [
  { path: "/candidate/home", element: <PrivateRoute role="candidate"><CaHome /></PrivateRoute> },
  { path: "/candidate/jobs-view", element: <PrivateRoute role="candidate"><CaJobsView /></PrivateRoute> },
  { path: "/candidate/profile", element: <PrivateRoute role="candidate"><CaProfile /></PrivateRoute> },
];
