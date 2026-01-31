import React from "react";
import HomePage from "../page/home/Home"; 
import ProgrammsDetail from "../page/detail/program/Detail";
import Login from "../page/login/Login";
import SignUp from "../page/signup/Signup";
import CandidateExternSystemApply from "../page/CandidatesExternSystemApply";
import { PartnerDetail} from "../page/short/Short";
import NewsDetail from "../page/detail/news/News";
import NewsList from "../page/news/List";

export const publicRoutes = [
  { path: "/home", element: <HomePage /> },
  { path: "/program/:slug", element: <ProgrammsDetail /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/programm-view/candidate-apply/:slug", element: <CandidateExternSystemApply /> },
  { path: "/collabor", element: <PartnerDetail /> },
  { path: "/news/:slug", element: <NewsDetail /> },
  { path: "/news-list", element: <NewsList /> },
];

