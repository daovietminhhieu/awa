import React from "react";
import Navbar from "../pages/NavBar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
