import React from 'react';
import { useHistory } from 'react-router-dom';
import './ITEquipmentLanding.css';

const ITEquipmentLanding = () => {
  const history = useHistory();

  return (
    <div className="landing-container">
      <div className="card view-card" onClick={() => history.push('/it-equipment-view')}>
        <div className="card-content">
          <h3>Afficher IT Equipments</h3>
          <p>⦿Voir tableau <br />⦿Exporter Excel</p>
        </div>
      </div>
      <div className="card modify-card" onClick={() => history.push('/it-equipment-manager')}>
        <div className="card-content">
          <h3>Modifier IT Equipments</h3>
          <p>⦿Plus d'infos</p>
        </div>
      </div>
    </div>
  );
};

export default ITEquipmentLanding;
