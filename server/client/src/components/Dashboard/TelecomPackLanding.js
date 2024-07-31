import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Modal from 'react-modal';
import { useAuth } from '../../hooks/useAuth'; // Ensure you have this hook to get user info
import './TelecomPackLanding.css';

Modal.setAppElement('#root');

const TelecomPackLanding = () => {
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
      history.push('/telecom-pack-manager'); // Change this path to the modify page path
    } else {
      openModal();
    }
  };

  return (
    <div className="telecom-landing-container">
      <div className="telecom-card telecom-view-card" onClick={() => history.push('/telecom-pack-view')}>
        <div className="telecom-card-content">
          <h3>Afficher Parc Telecom</h3>
          <p>⦿Voir tableau <br />⦿Exporter Excel</p>
        </div>
      </div>
      <div className="telecom-card telecom-modify-card" onClick={handleModifyClick}>
        <div className="telecom-card-content">
          <h3>Modifier Parc Telecom</h3>
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
        <h2>Accès refusé</h2>
        <p>Vous n'avez pas la permission de modifier cette page.</p>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default TelecomPackLanding;
