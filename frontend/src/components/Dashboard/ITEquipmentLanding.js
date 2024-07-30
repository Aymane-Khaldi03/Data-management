import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';
import { useAuth } from '../../hooks/useAuth'; // Ensure you have this hook to get user info
import './ITEquipmentLanding.css';

Modal.setAppElement('#root');

const ITEquipmentLanding = () => {
  const history = useHistory();
  const { user } = useAuth(); // Get the user info including the role
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleModifyClick = () => {
    if (user && user.role === 'admin') {
      history.push('/it-equipment-manager'); // Change this path to the modify page path
    } else {
      openModal();
    }
  };

  return (
    <div className="landing-container">
      <div className="card view-card" onClick={() => history.push('/it-equipment-view')}>
        <div className="card-content">
          <h3>Afficher IT Equipments</h3>
          <p>⦿Voir tableau <br />⦿Exporter Excel</p>
        </div>
      </div>
      <div className="card modify-card" onClick={handleModifyClick}>
        <div className="card-content">
          <h3>Modifier IT Equipments</h3>
          <p>⦿Plus d'infos</p>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Access Denied"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Access Denied</h2>
        <p>You do not have permission to modify this page.</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default ITEquipmentLanding;
