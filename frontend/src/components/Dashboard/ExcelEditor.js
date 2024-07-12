import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './ExcelEditor.css';
import { FaFileExcel } from 'react-icons/fa';

const ExcelEditor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [table, setTable] = useState('');
  const [schema, setSchema] = useState([]);
  const [message, setMessage] = useState('');
  const [matchingColumns, setMatchingColumns] = useState(0);

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
          setMessage('Erreur lors de la récupération du schéma');
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

  const filterColumns = (data) => {
    if (schema.length === 0) return data;
    return data.map(record => {
      return Object.fromEntries(
        Object.entries(record).filter(([key]) => schema.includes(key))
      );
    });
  };

  const countMatchingColumns = (data) => {
    if (schema.length === 0 || data.length === 0) return 0;
    return schema.filter(column => Object.keys(data[0]).includes(column)).length;
  };

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const filteredData = filterColumns(data);
        setMatchingColumns(countMatchingColumns(filteredData));
      };
      reader.readAsBinaryString(selectedFile);
    }
  }, [selectedFile, schema]);

  return (
    <div className="excel-editor">
      <h2>Téléchargement de fichier Excel</h2>
      <div className="form-group">
        <label>Sélectionnez le fichier Excel</label>
        <div className="file-upload">
          <input type="file" onChange={handleFileChange} />
          <div className="file-upload-text">
            {selectedFile ? (
              <>
                <FaFileExcel className="file-icon" />
                {selectedFile.name}
              </>
            ) : (
              <>Déposez vos fichiers ici ou <span className="browse-files">Parcourir les fichiers</span></>
            )}
          </div>
          <div className="file-type-text">Types de fichiers acceptés : .xlsx</div>
        </div>
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
        <div className="schema-container">
          <h3>Schéma du tableau</h3>
          <p>Nombre de colonnes correspondantes : {matchingColumns}</p>
          <div className="schema-table">
            {schema.map((column) => (
              <div key={column} className="schema-column">
                {column}
                <div className="placeholder">
                  {column === 'numero_de_gsm' && 'Ex: 212XXXXXXXXX'}
                  {column.includes('date') && 'Format: yyyy-mm-dd ou mm/dd/yyyy'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelEditor;
