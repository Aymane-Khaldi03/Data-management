import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
  const [isActive, setIsActive] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`sidebar-container ${isActive ? 'active' : 'minimized'}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isActive ? 'active' : 'minimized'}`}>
        <nav>
          <ul>
            {user && user.role === 'admin' && (
              <li>
                <NavLink to="/dashboard" activeClassName="active">
                  <span className="icon">🏠</span>
                  <span className="text">Dashboard</span>
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/telecom-packs" activeClassName="active">
                <span className="icon">📦</span>
                <span className="text">Parc Telecom</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/telephone-lines" activeClassName="active">
                <span className="icon">📞</span>
                <span className="text">Ligne Téléphonique</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/it-equipment" activeClassName="active">
                <span className="icon">💻</span>
                <span className="text">Matériel informatique</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/edit-excel" activeClassName="active">
                <span className="icon">📂</span>
                <span className="text">Importer Excel</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="logout-container">
          <button onClick={handleLogout} className="logout-button">
            <span className="icon">🔒</span>
            <span className="text">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
