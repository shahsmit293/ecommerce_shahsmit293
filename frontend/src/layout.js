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
import Inbox from "./pages/inbox";
import PaymentSuccess from "./components/successfullpayment";
import CancelPayment from "./components/cancelpayment";
import Cart from "./pages/cart";
import Favorite from "./pages/favorites";
import Purchase from "./pages/purchase";
import Sold from "./pages/sold";
import FilterPage from "./pages/filterpage";
import MyListing from "./pages/mylisting";
import Meetings from "./pages/meetings";
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
        <Route path="/viewphone/:phone_id" element={<ViewEachPhone />} />
        <Route path="/chat" element={<PersonalChat />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/paymentsuccess" element={<PaymentSuccess />} />
        <Route path="/paymentcancel" element={<CancelPayment />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/sold" element={<Sold />} />
        <Route path="/filter" element={<FilterPage />} />
        <Route path="/mylisting" element={<MyListing />} />
        <Route path="/meetings" element={<Meetings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
