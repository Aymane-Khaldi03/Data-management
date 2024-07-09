import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [userHistory, setUserHistory] = useState([]);
  const [modificationHistory, setModificationHistory] = useState([]);
  const [telecomModificationHistory, setTelecomModificationHistory] = useState([]);
  const [telephoneLineModificationHistory, setTelephoneLineModificationHistory] = useState([]);

  const handleNavigation = (path) => {
    history.push(path);
  };

  useEffect(() => {
    fetchUserHistory();
    fetchModificationHistory();
    fetchTelecomModificationHistory();
    fetchTelephoneLineModificationHistory(); // Add this line
  }, []);

  const fetchTelephoneLineModificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/telephone-lines/admin/telephone-line-modifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Telephone Line Modifications:', data);
        setTelephoneLineModificationHistory(data);
      } else {
        console.error('Failed to fetch telephone line modification history');
      }
    } catch (error) {
      console.error('Error fetching telephone line modification history:', error);
    }
  };


  const fetchUserHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/admin/user-history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched User History:', data);
        setUserHistory(data);
      } else {
        console.error('Failed to fetch user history');
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  };

  const fetchModificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/it-equipment-modifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const filteredData = data.filter(mod => mod.field !== 'createdAt' && mod.field !== 'updatedAt');
        setModificationHistory(filteredData);
      } else {
        console.error('Failed to fetch modification history');
      }
    } catch (error) {
      console.error('Error fetching modification history:', error);
    }
  };

  const fetchTelecomModificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/telecom-packs/admin/telecom-pack-modifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched Telecom Modifications:', data);
        setTelecomModificationHistory(data);
      } else {
        console.error('Failed to fetch telecom modification history');
      }
    } catch (error) {
      console.error('Error fetching telecom modification history:', error);
    }
  };

  const handleResetModificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/telecom-packs/admin/telecom-pack-modifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setTelecomModificationHistory([]);
        console.log('Modification history reset successfully');
      } else {
        console.error('Failed to reset modification history');
      }
    } catch (error) {
      console.error('Error resetting modification history:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-content">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>

        <div className="admin-user-history-section">
          <h2>User Login History</h2>
          {userHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {userHistory.map((user, index) => (
                    <tr key={index}>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>{formatDate(user.lastLogin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No user login history available.</p>
          )}
        </div>

        <div className="admin-modification-history-section">
          <h2>IT Equipment Modification History</h2>
          <button onClick={handleResetModificationHistory} className="reset-button">Reset History</button>
          {modificationHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Modification Time</th>
                    <th>Field</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {modificationHistory.map((modification, index) => (
                    <tr key={index}>
                      <td>{modification.User.fullName}</td>
                      <td>{modification.User.email}</td>
                      <td>{formatDate(modification.modifiedAt)}</td>
                      <td>{modification.field}</td>
                      <td>{modification.oldValue}</td>
                      <td>{modification.newValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No IT equipment modification history available.</p>
          )}
        </div>

        <div className="admin-modification-history-section">
          <h2>Telecom Pack Modification History</h2>
          {telecomModificationHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Modification Time</th>
                    <th>Field</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {telecomModificationHistory.map((modification, index) => (
                    <tr key={index}>
                      <td>{modification.User.fullName}</td>
                      <td>{modification.User.email}</td>
                      <td>{formatDate(modification.modifiedAt)}</td>
                      <td>{modification.field}</td>
                      <td>{modification.oldValue ? modification.oldValue : 'N/A'}</td>
                      <td>{modification.newValue ? modification.newValue : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No Telecom Pack modification history available.</p>
          )}
        </div>
        <div className="admin-modification-history-section">
          <h2>Telephone Line Modification History</h2>
          {telephoneLineModificationHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Modification Time</th>
                    <th>Field</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                  </tr>
                </thead>
                <tbody>
                  {telephoneLineModificationHistory.map((modification, index) => (
                    <tr key={index}>
                      <td>{modification.User.fullName}</td>
                      <td>{modification.User.email}</td>
                      <td>{formatDate(modification.modifiedAt)}</td>
                      <td>{modification.field}</td>
                      <td>{modification.oldValue ? modification.oldValue : 'N/A'}</td>
                      <td>{modification.newValue ? modification.newValue : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No Telephone Line modification history available.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
