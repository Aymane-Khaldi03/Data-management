import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TelephoneLine = () => {
  const [telephoneLines, setTelephoneLines] = useState([]);

  useEffect(() => {
    const fetchTelephoneLines = async () => {
      const response = await axios.get('/api/telephone-lines');
      setTelephoneLines(response.data);
    };

    fetchTelephoneLines();
  }, []);

  return (
    <div className="telephone-line">
      <h1>Telephone Lines</h1>
      <ul>
        {telephoneLines.map((line) => (
          <li key={line.id}>{line.number}</li>
        ))}
      </ul>
    </div>
  );
};

export default TelephoneLine;