import React, { useEffect, useState } from 'react';
import { Route, Switch, Redirect, useLocation, BrowserRouter as Router } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import Navbar from './components/Shared/Navbar';
import Sidebar from './components/Shared/Sidebar';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ExcelEditor from './components/Dashboard/ExcelEditor';
//
import ITEquipmentLanding from './components/Dashboard/ITEquipmentLanding';
import ITEquipmentView from './components/Dashboard/ITEquipmentView';
import ITEquipment from './components/Dashboard/ITEquipment';
//
import TelecomPack from './components/Dashboard/TelecomPack';
import TelecomPackLanding from './components/Dashboard/TelecomPackLanding';
import TelecomPackView from './components/Dashboard/TelecomPackView';

import './App.css';

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine if the current path is the homepage, signup page, or login page
  const showSidebar = !['/', '/signup', '/login'].includes(location.pathname);
  const isAuthenticated = !!user; // Check if the user is authenticated

  const getDashboardComponent = () => {
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'consultant':
        return <ConsultantDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Navbar />
      <div className={`main-content ${showSidebar ? 'with-sidebar' : ''}`}>
        {showSidebar && <Sidebar />}
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/dashboard" exact render={getDashboardComponent} />
          
          <Route path="/it-equipment" exact component={ITEquipmentLanding} />
          <Route path="/it-equipment-manager" component={ITEquipment} />
          <Route path="/it-equipment-view" component={ITEquipmentView} />

          <Route path="/telecom-packs" exact component={TelecomPackLanding} />
          <Route path="/telecom-pack-manager" component={TelecomPack} />
          <Route path="/telecom-pack-view" component={TelecomPackView} />

          <Route path="/edit-excel" component={ExcelEditor} />
        </Switch>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
