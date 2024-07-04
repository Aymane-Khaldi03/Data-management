import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const [isActive, setIsActive] = useState(false);
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰ Menu
      </button>
      <div className={`sidebar ${isActive ? 'active' : ''}`}>
        <nav>
          <ul>
            <li>
              <NavLink to="/dashboard" activeClassName="active">
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/telecom-packs" activeClassName="active">
                Parc Telecom
              </NavLink>
            </li>
            <li>
              <NavLink to="/telephone-lines" activeClassName="active">
                Ligne Téléphonique
              </NavLink>
            </li>
            <li>
              <NavLink to="/it-equipment" activeClassName="active">
                Matériel informatique
              </NavLink>
            </li>
            <li>
              <NavLink to="/edit-excel" activeClassName="active">
                Editer Excel
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="logout-container">
          <button onClick={logout} className="logout-button">
            Logout
            <span className="logout-icon">🔒</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
