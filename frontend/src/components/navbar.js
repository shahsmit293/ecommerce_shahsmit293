import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);

  const handleLogout = () => {
    actions.logout();
    window.location.reload();
    navigate('/'); // Optionally navigate to login page after logout
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <button className="navbar-brand" onClick={() => navigate('/')} >Navbar</button>
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button className="nav-link active" aria-current="page" onClick={() => navigate('/')}>Home</button>
            </li>
            {!store.token && (
              <>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => navigate('/signup')}>SignUp</button>
                </li>
              </>
            )}
            {store.token && (
              <>
                <li className="nav-item">
                  <button className="nav-link" onClick={() => navigate('/temper')}>Temper</button>
                </li>
                <li className="nav-item">
                  <button className="nav-link" onClick={handleLogout}>Logout</button>
                </li>
                <li className="nav-item dropdown">
                  <h4
                    className="nav-link dropdown-toggle"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Sell
                  </h4>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li>
                      <button className="dropdown-item" onClick={() => navigate('/sell/iphone')}>iPhone</button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => navigate('/sell/samsung')}>Samsung</button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => navigate('/sell/google')}>Google</button>
                    </li>
                  </ul>
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
