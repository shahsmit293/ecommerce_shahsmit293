import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/navbar.css'; // Import custom CSS for additional styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faSignOutAlt, faShoppingCart, faUser, faTags } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

const Navbar = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

  const handleLogout = () => {
    actions.logout();
    navigate('/');
    window.location.reload();
  };

  // Function to close the navbar after a menu item is clicked
  const handleMenuClose = () => {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const collapseMenu = document.querySelector('#navbarNav');

    if (navbarToggler && collapseMenu.classList.contains('show')) {
      navbarToggler.click(); // Trigger the toggler to collapse the menu
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container d-flex justify-content-between align-items-center">
        <p className="navbar-brand brand-logo" onClick={() => navigate('/')}>
          GetWellPhone
        </p>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-lg-center">
            {!store.token && (
              <>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => { navigate('/login'); handleMenuClose(); }}>
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => { navigate('/signup'); handleMenuClose(); }}>
                    Sign Up
                  </button>
                </li>
              </>
            )}
            {store.token && (
              <>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => { navigate('/inbox'); handleMenuClose(); }}>
                    <FontAwesomeIcon icon={faEnvelope} /> Inbox
                  </button>
                </li>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <FontAwesomeIcon icon={faTags} /> Sell
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li>
                      <button className="dropdown-item" onClick={() => { navigate('/sell/iphone'); handleMenuClose(); }}>
                        iPhone
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => { navigate('/sell/samsung'); handleMenuClose(); }}>
                        Samsung
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => { navigate('/sell/google'); handleMenuClose(); }}>
                        Google
                      </button>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => { navigate('/cart'); handleMenuClose(); }}>
                    <FontAwesomeIcon icon={faShoppingCart} /> Cart
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                    <FontAwesomeIcon icon={faUser} /> Profile
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
