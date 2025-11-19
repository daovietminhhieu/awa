import React from "react";
import HomePage from "../pages/Home";
import Detail from "../pages/Detail";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import CandidateExternSystemApply from "../pages/CandidateExternSystemApply";
import { DetailSuccessStory, EventDetail, PartnerDetail, TipDetail } from "../components/Short";
import Layout from "./Layout";

export const publicRoutes = [
  { path: "/home", element: <Layout><HomePage /></Layout> },
  { path: "/programm/:slug", element: <Layout><Detail /></Layout> },
  { path: "/login", element: <Layout><Login /></Layout> },
  { path: "/signup", element: <Layout><SignUp /></Layout> },
  { path: "programm-view/candidate-apply/:slug", element: <Layout><CandidateExternSystemApply /></Layout> },
  { path: "success-story-detail/:slug", element: <Layout><DetailSuccessStory /></Layout> },
  { path: "/tip-detail/:slug", element: <Layout><TipDetail /></Layout> },
  { path: "/event-detail/:slug", element: <Layout><EventDetail /></Layout> },
  { path: "/collabor", element: <Layout><PartnerDetail /></Layout> },
];
