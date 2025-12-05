import React from "react";
import "../colors/index.css";
import Navbar from "../components/navbar/Navbar.jsx";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer.jsx";

export default function Layout() {
  return (
    <div className="theme-xmas">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
