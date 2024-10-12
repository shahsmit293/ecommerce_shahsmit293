import React, { useContext, useState } from "react";
import Favorite from "./favorites"; // Import Favorite component
import Purchase from "./purchase"; // Import Purchase component
import Sold from "./sold"; // Import Sold component
import MyListing from "./mylisting"; // Import MyListing component
import Meetings from "./meetings"; // Import Meetings component
import '../styles/profile.css'; // Import CSS for this page
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [activeComponent, setActiveComponent] = useState("favorite"); // State to control active component
  const {store,actions} =useContext(Context)
  const navigate = useNavigate()
  const renderComponent = () => {
    switch (activeComponent) {
      case "favorite":
        return <Favorite />;
      case "purchase":
        return <Purchase />;
      case "sold":
        return <Sold />;
      case "listing":
        return <MyListing />;
      case "meetings":
        return <Meetings />;
      default:
        return <Favorite />;
    }
  };
  if (!store.token) {
    return (
      <div>
        Please log in to view this page.
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }
  return (
    <div className="activity-container">
      <div className="button-container">
        <button
          className={`toggle-button ${activeComponent === "favorite" ? "active" : ""}`}
          onClick={() => setActiveComponent("favorite")}
        >
          My Favorites
        </button>
        <button
          className={`toggle-button ${activeComponent === "purchase" ? "active" : ""}`}
          onClick={() => setActiveComponent("purchase")}
        >
          My Purchases
        </button>
        <button
          className={`toggle-button ${activeComponent === "sold" ? "active" : ""}`}
          onClick={() => setActiveComponent("sold")}
        >
          My Sold Phones
        </button>
        <button
          className={`toggle-button ${activeComponent === "listing" ? "active" : ""}`}
          onClick={() => setActiveComponent("listing")}
        >
          My Listings
        </button>
        <button
          className={`toggle-button ${activeComponent === "meetings" ? "active" : ""}`}
          onClick={() => setActiveComponent("meetings")}
        >
          Meetings
        </button>
      </div>
      <div className="component-container">
        {renderComponent()}
      </div>
    </div>
  );
};

export default Profile;
