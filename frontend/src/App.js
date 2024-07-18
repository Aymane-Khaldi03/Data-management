import React from 'react';
import { Route, Switch, Redirect, useLocation, BrowserRouter as Router } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import Navbar from './components/Shared/Navbar';
import Sidebar from './components/Shared/Sidebar';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ExcelEditor from './components/Dashboard/ExcelEditor';
import ITEquipmentLanding from './components/Dashboard/ITEquipmentLanding';
import ITEquipmentView from './components/Dashboard/ITEquipmentView';
import ITEquipment from './components/Dashboard/ITEquipment';
import TelecomPack from './components/Dashboard/TelecomPack';
import TelecomPackLanding from './components/Dashboard/TelecomPackLanding';
import TelecomPackView from './components/Dashboard/TelecomPackView';
import TelephoneLine from './components/Dashboard/TelephoneLine';
import TelephoneLineLanding from './components/Dashboard/TelephoneLineLanding';
import TelephoneLineView from './components/Dashboard/TelephoneLineView';

import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const showSidebar = !['/', '/signup', '/login'].includes(location.pathname);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/') {
    return <Redirect to="/login" />;
  }

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'consultant':
        return <ConsultantDashboard />;
      default:
        return <Redirect to="/login" />;
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
          <Route path="/dashboard" render={getDashboardComponent} />
          
          <Route path="/it-equipment" exact component={ITEquipmentLanding} />
          <Route path="/it-equipment-manager" component={ITEquipment} />
          <Route path="/it-equipment-view" component={ITEquipmentView} />

          <Route path="/telecom-packs" exact component={TelecomPackLanding} />
          <Route path="/telecom-pack-manager" component={TelecomPack} />
          <Route path="/telecom-pack-view" component={TelecomPackView} />

          <Route path="/telephone-lines" exact component={TelephoneLineLanding} />
          <Route path="/telephone-line-manager" component={TelephoneLine} />
          <Route path="/telephone-line-view" component={TelephoneLineView} />

          <Route path="/edit-excel" component={ExcelEditor} />

          {/* Redirect to login if trying to access other routes without authentication */}
          <Route path="*">
            {user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
          </Route>
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
