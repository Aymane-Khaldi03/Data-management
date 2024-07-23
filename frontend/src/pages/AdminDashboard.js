import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const history = useHistory();
  const [userHistory, setUserHistory] = useState([]);
  const [modificationHistory, setModificationHistory] = useState([]);
  const [telecomModificationHistory, setTelecomModificationHistory] = useState([]);
  const [telephoneLineModificationHistory, setTelephoneLineModificationHistory] = useState([]);

  const handleNavigation = (path) => {
    history.push(path);
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
      const response = await fetch('http://localhost:5000/api/it-equipments/admin/it-equipment-modifications', {
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

// Fetch Telephone Line modification history
const fetchTelephoneLineModificationHistory = async () => {
  try {
    console.log('Fetching Telephone Line modification history...'); // Debugging statement
    const response = await fetch('http://localhost:5000/api/telephone-lines/admin/telephone-line-modifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Fetched Telephone Line Modifications:', data); // Debugging statement
      if (data.length === 0) {
        console.log('No modification records found'); // Debugging statement
      } else {
        data.forEach(mod => {
          console.log('Modification Record:', JSON.stringify(mod, null, 2)); // Debugging statement for each record
        });
      }
      setTelephoneLineModificationHistory(data);
    } else {
      console.error('Failed to fetch telephone line modification history, status:', response.status); // Debugging statement
    }
  } catch (error) {
    console.error('Error fetching telephone line modification history:', error); // Debugging statement
  }
};

  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('token');
      if (!token) {
        history.push('/login');
      }
    }
  }, [loading, history]);

  useEffect(() => {
    if (user) {
      fetchUserHistory();
      fetchModificationHistory();
      fetchTelecomModificationHistory();
      fetchTelephoneLineModificationHistory();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }
  const handleResetModificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/it-equipments/admin/it-equipment-modifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (response.ok) {
        setModificationHistory([]); // Clear the modification history in the state
        console.log('Modification history reset successfully');
      } else {
        console.error('Failed to reset modification history');
      }
    } catch (error) {
      console.error('Error resetting modification history:', error);
    }
  };

  const handleResetTelecomModificationHistory = async () => {
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
        console.log('Telecom Pack modification history reset successfully');
      } else {
        console.error('Failed to reset Telecom Pack modification history');
      }
    } catch (error) {
      console.error('Error resetting Telecom Pack modification history:', error);
    }
  };

  const handleResetTelephoneLineModificationHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/telephone-lines/admin/telephone-line-modifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setTelephoneLineModificationHistory([]);
        console.log('Telephone Line modification history reset successfully');
      } else {
        console.error('Failed to reset Telephone Line modification history');
      }
    } catch (error) {
      console.error('Error resetting Telephone Line modification history:', error);
    }
  };

  const handleDropTable = async (table) => {
    const confirmDrop = window.confirm(`Are you sure you want to drop the ${table} table? This action cannot be undone.`);
    if (confirmDrop) {
      try {
        let requestUrl = '';
        if (table === 'it-equipments') {
          requestUrl = 'http://localhost:5000/api/it-equipments/admin/drop-it-equipments-table';
        } else if (table === 'telecom-pack') {
          requestUrl = 'http://localhost:5000/api/telecom-packs/admin/drop-telecom-packs-table';
        } else if (table === 'telephone-lines') {
          requestUrl = 'http://localhost:5000/api/telephone-lines/admin/drop-telephone-lines-table';
        }
  
        console.log(`Request URL: ${requestUrl}`);
  
        const response = await axios.delete(requestUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        console.log("Response:", response);
  
        if (response.status === 204) {
          console.log(`${table} table dropped successfully`);
        } else {
          console.error(`Failed to drop ${table} table: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error dropping ${table} table:`, error.message);
        alert(`Error dropping ${table} table: ${error.message}`);
      }
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
          <h2>Historique de connexion utilisateur</h2>
          {userHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nom et Prénom</th>
                    <th>Dernière connexion</th>
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
            <p>Aucun historique de connexion utilisateur disponible.</p>
          )}
        </div>

        <div className="admin-modification-history-section">
          <h2>Historique des modifications de Matériel informatique</h2>
          <button onClick={handleResetModificationHistory} className="reset-button">Réinitialiser</button>
          {user.role === 'admin' && (
            <button onClick={() => handleDropTable('it-equipments')} className="drop-button">
              Supprimer la table
            </button>
          )}
          {modificationHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Temps de Modification</th>
                    <th>Champ</th>
                    <th>Ancienne Valeur</th>
                    <th>Nouvelle valeur</th>
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
            <p>Aucun historique de modification de Matériel Informatique disponible.</p>
          )}
        </div>

        <div className="admin-modification-history-section">
          <h2>Historique des modifications du Parc Télécom</h2>
          <button onClick={handleResetTelecomModificationHistory} className="reset-button">Réinitialiser</button>
          {user.role === 'admin' && (
            <button onClick={() => handleDropTable('telecom-pack')} className="drop-button">
              Supprimer la table
            </button>
          )}
          {telecomModificationHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Temps de Modification</th>
                    <th>Champ</th>
                    <th>Ancienne Valeur</th>
                    <th>Nouvelle valeur</th>
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
            <p>Aucun historique de modification du Parc Télécom disponible.</p>
          )}
        </div>

        <div className="admin-modification-history-section">
          <h2>Historique des modifications des Lignes Téléphoniques</h2>
          <button onClick={handleResetTelephoneLineModificationHistory} className="reset-button">Réinitialiser</button>
          {user.role === 'admin' && (
            <button onClick={() => handleDropTable('telephone-lines')} className="drop-button">
              Supprimer la table
            </button>
          )}
          {telephoneLineModificationHistory.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Temps de Modification</th>
                    <th>Champ</th>
                    <th>Ancienne Valeur</th>
                    <th>Nouvelle valeur</th>
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
            <p>Aucun historique de modification de Ligne Téléphonique disponible.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
