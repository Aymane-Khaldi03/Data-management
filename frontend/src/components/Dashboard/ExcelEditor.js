import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExcelEditor.css';

const ExcelEditor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [table, setTable] = useState('');
  const [schema, setSchema] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (table) {
      const fetchSchema = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/schema/${table}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          setSchema(response.data);
        } catch (error) {
          setMessage('Error fetching schema');
          console.error('Error fetching schema:', error);
        }
      };
      fetchSchema();
    }
  }, [table]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile || !table) {
        alert('Veuillez sélectionner un tableau et un fichier.');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post(`http://localhost:5000/api/upload/${table}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      console.log('File uploaded successfully:', response.data);
      setMessage('Fichier téléchargé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Erreur lors du téléchargement du fichier: ' + error.message);
      setMessage('Erreur lors du téléchargement du fichier: ' + error.message);
    }
  };

  return (
    <div className="excel-editor">
      <h2>Téléchargement de fichier Excel</h2>
      <div className="form-group">
        <label>Sélectionnez le fichier Excel</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div className="form-group">
        <label>Sélectionnez un tableau</label>
        <select value={table} onChange={(e) => setTable(e.target.value)}>
          <option value="">Sélectionnez un tableau</option>
          <option value="it_equipments">Équipements informatiques</option>
          <option value="telecom_pack">Pack Télécom</option>
          <option value="telephone_lines">Lignes téléphoniques</option>
        </select>
      </div>
      <button onClick={handleUpload}>Télécharger</button>
      {message && <p>{message}</p>}
      {schema.length > 0 && (
        <div>
          <h3>Schéma du tableau</h3>
          <ul>
            {schema.map((column) => (
              <li key={column}>{column}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExcelEditor;
