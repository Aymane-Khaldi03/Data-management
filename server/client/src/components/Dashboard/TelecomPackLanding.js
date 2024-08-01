import React from 'react';
import { useHistory } from 'react-router-dom';
import './TelecomPackLanding.css';

const TelecomPackLanding = () => {
  const history = useHistory();

  return (
    <div className="telecom-landing-container">
      <div className="telecom-card telecom-view-card" onClick={() => history.push('/telecom-pack-view')}>
        <div className="telecom-card-content">
          <h3>Afficher Parc Télécom</h3>
          <p>⦿Voir tableau <br />⦿Exporter Excel</p>
        </div>
      </div>
      <div className="telecom-card telecom-modify-card" onClick={() => history.push('/telecom-pack-manager')}>
        <div className="telecom-card-content">
          <h3>Modifier Parc Télécom</h3>
          <p>⦿Plus d'infos</p>
        </div>
      </div>
    </div>
  );
};

export default TelecomPackLanding;
