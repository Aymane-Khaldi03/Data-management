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
        alert('Please select a table and a file.');
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
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    }
  };  

  return (
    <div className="excel-editor">
      <h2>Excel File Upload</h2>
      <div>
        <label>Select Excel file</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div>
        <label>Select Table</label>
        <select value={table} onChange={(e) => setTable(e.target.value)}>
          <option value="">Select a table</option>
          <option value="it_equipments">IT Equipments</option>
          <option value="telecom_pack">Telecom Pack</option>
          <option value="telephone_lines">Telephone Lines</option>
        </select>
      </div>
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
      {schema.length > 0 && (
        <div>
          <h3>Table Schema</h3>
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
