import React from 'react';
import { useHistory } from 'react-router-dom';
import './TelephoneLineLanding.css';

const TelephoneLineLanding = () => {
  const history = useHistory();

  return (
    <div className="telephone-landing-container">
      <div className="telephone-card telephone-view-card" onClick={() => history.push('/telephone-line-view')}>
        <div className="telephone-card-content">
          <h3>Afficher GSM</h3>
          <p>⦿Voir tableau <br />⦿Exporter Excel</p>
        </div>
      </div>
      <div className="telephone-card telephone-modify-card" onClick={() => history.push('/telephone-line-manager')}>
        <div className="telephone-card-content">
          <h3>Modifier GSM</h3>
          <p>⦿Plus d'infos</p>
        </div>
      </div>
    </div>
  );
};

export default TelephoneLineLanding;
