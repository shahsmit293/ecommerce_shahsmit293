import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./pages/App";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Signup from "./pages/signup";
const Layout = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
