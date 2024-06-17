import React, { useContext } from 'react';
import { Context } from '../store/appContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  // Redirect to login page if token is null
  if (!store.token) {
    // You can use a modal or any other UI component for the popup
    alert("Please login to view this page.");
    navigate('/login'); // Navigate to login page
    return null; // Render nothing while redirecting
  }

  // Render welcome message if token is available
  return (
    <div>
      <h2>Welcome, {store.user.username}!</h2>
      <p>Your email: {store.user.email}</p>
      {/* Additional profile information */}
    </div>
  );
};

export default Profile;
