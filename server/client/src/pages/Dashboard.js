import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const history = useHistory();

  const handleNavigation = (path) => {
    history.push(path);
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-item" onClick={() => handleNavigation('/dashboard')}>
          Dashboard
        </div>
        <div className="sidebar-item" onClick={() => handleNavigation('/telecom-packs')}>
          Telecom Packs
        </div>
        <div className="sidebar-item" onClick={() => handleNavigation('/telephone-lines')}>
          Telephone Lines
        </div>
        <div className="sidebar-item" onClick={() => handleNavigation('/it-equipments')}>
          IT Equipments
        </div>
      </aside>
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome, {user.fullName}!</p>
        <div className="profile-section">
          <h2>Your Profile</h2>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
