import React from 'react';
import './Home.css';
import backgroundImage from '../assets/bp.avif'; // Adjust the path as necessary
import Sidebar from '../components/Shared/Sidebar'; // Adjust the path as necessary

const Home = () => {
  console.log('Home component rendered');
  return (
    <div className="home-container">
      <Sidebar />
      <div className="home">
        <div className="home-content">
          <h1>Bienvenue sur le site de la Banque Populaire</h1>
          <p>Ceci est la page d'accueil de notre application.</p>
          <p>Nous vous offrons les meilleurs services bancaires pour répondre à vos besoins financiers.</p>
          <img src={backgroundImage} alt="Banque Populaire" />
        </div>
        <div className="footer">
          <footer>&copy; 2024 Banque Populaire. Tous droits réservés.</footer>
        </div>
      </div>
    </div>
  );
};

export default Home;
