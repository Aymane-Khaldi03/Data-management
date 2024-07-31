import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Correct import
import logo from '../../assets/logo.png'; // Adjust the path as necessary
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user; // Determine if the user is authenticated

  return (
    <nav className="navbar">
      <img src={logo} alt="App Logo" className="logo" />
      <ul>
        <li>
          <Link to="/" className="nav-link">Home</Link>
        </li>
        {isAuthenticated ? (
          <>
            {user.role === 'admin' && (
              <li>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
            )}
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li>
              <Link to="/signup" className="nav-link">Signup</Link>
            </li>
          </>
        )}
      </ul>
      {isAuthenticated && (
        <div className="user-info">
          <span className="user-icon">👤</span>
          {user.fullName}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
