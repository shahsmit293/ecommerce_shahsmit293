import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./pages/App";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Signup from "./pages/signup";
import SellIphone from "./pages/selliphone";
import SellSamsung from "./pages/sellsamsung";
import SellGoogle from "./pages/sellgoogle";
import ViewEachPhone from "./pages/vieweachphone";
import Navbar from "./components/navbar";
import PersonalChat from "./pages/personalchat";
import Temper from "./pages/temper";
const Layout = () => {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sell/iphone" element={<SellIphone />} />
        <Route path="/sell/samsung" element={<SellSamsung />} />
        <Route path="/sell/google" element={<SellGoogle />} />
        <Route path="/viewphone/:seller_id" element={<ViewEachPhone />} />
        <Route path="/chat" element={<PersonalChat />} />
        <Route path="/temper" element={<Temper />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
