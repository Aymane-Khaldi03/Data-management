import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import './TelephoneLine.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const setDefaultValues = (data, defaultValue = '------') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        return [key, defaultValue];
      }
      return [key, value];
    })
  );
};

const getCustomHeaderName = (header) => {
  const customNames = {
    numero_de_gsm: 'Numero de GSM',
    full_name: 'Nom et Prénom',
    code_entite: 'Code Entité',
    direction: 'Direction',
    fonction: 'Fonction',
    operateur: 'Opérateur',
    categorie: 'Catégorie',
    poste_GSM: 'Poste GSM',
  };
  return customNames[header] || header.replace(/_/g, ' ');
};

const TelephoneLine = () => {
  const [telephoneLines, setTelephoneLines] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [options, setOptions] = useState({
    code_entite: [],
    direction: [],
    fonction: [],
    operateur: [],
    categorie: [],
    poste_GSM: [],
  });
  const [filters, setFilters] = useState({});
  const [newLine, setNewLine] = useState({
    numero_de_gsm: '',
    full_name: '',
    code_entite: '',
    direction: '',
    fonction: '',
    operateur: '',
    categorie: '',
    poste_GSM: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);
  const history = useHistory();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Define the page size
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };

  useEffect(() => {
    const fetchTelephoneLines = async () => {
      try {
          const response = await axios.get(`${API_URL}/api/telephone-lines`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data.map(line => setDefaultValues(line));
        setOriginalData(data);
        applyFilters(data, filters); // Apply filters on initial load
      } catch (error) {
        console.error('Error fetching Telephone Lines:', error.message);
        alert('Failed to fetch telephone lines: ' + error.message);
      }
    };

    fetchTelephoneLines();
    fetchDropdownOptions();
  }, []);

  const fetchDropdownOptions = async () => {
    try {
      const fields = ['code_entite', 'direction', 'fonction', 'operateur', 'categorie', 'poste_GSM', 'numero_de_gsm', 'full_name'];
      const fetchedOptions = {};
      for (const field of fields) {
        const response = await axios.get(`${API_URL}/api/telephone-lines/dropdown/${field}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const uniqueValues = Array.from(new Set(response.data.filter(value => value !== '')));
        fetchedOptions[field] = uniqueValues.map(value => ({ value, label: value }));
      }
      setOptions(fetchedOptions);
    } catch (error) {
      console.error('Error fetching dropdown options:', error.message);
      alert('Failed to fetch dropdown options: ' + error.message);
    }
  };

  const applyFilters = (data, appliedFilters) => {
    let filteredData = data;

    Object.keys(appliedFilters).forEach(filterKey => {
      if (appliedFilters[filterKey].length > 0) {
        filteredData = filteredData.filter(item => appliedFilters[filterKey].includes(item[filterKey]));
      }
    });

    setFilteredData(filteredData);
    setCurrentPage(1); // Reset to the first page after applying filters
  };

  const handleFilterChange = (field, selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFilters(prevFilters => {
      const updatedFilters = {
        ...prevFilters,
        [field]: values
      };
      applyFilters(originalData, updatedFilters);
      return updatedFilters;
    });
  };

  const handleRemoveFilter = (field, value) => {
    const updatedValues = filters[field].filter(item => item !== value);
    const updatedFilters = { ...filters, [field]: updatedValues };
    setFilters(updatedFilters);
    applyFilters(originalData, updatedFilters);
  };

  const handleAddLine = async () => {
    if (!newLine.numero_de_gsm) {
      alert('The "numero_de_gsm" field must be filled.');
      return;
    }

    try {
      const formattedLine = setDefaultValues(newLine);
      const response = await axios.post(`${API_URL}/api/telephone-lines`, formattedLine, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const addedLine = response.data;
      const updatedData = [...originalData, addedLine];
      setOriginalData(updatedData);
      applyFilters(updatedData, filters);
      setNewLine({
        numero_de_gsm: '',
        full_name: '',
        code_entite: '',
        direction: '',
        fonction: '',
        operateur: '',
        categorie: '',
        poste_GSM: '',
      });
    } catch (error) {
      console.error('Error adding Telephone Line:', error.message);
      alert('Failed to add telephone line: ' + error.message);
    }
  };

  const handleModifyLine = (line) => {
    setIsEditing(true);
    setCurrentLine(line);
  };

  const handleUpdateLine = async () => {
    try {
      const formattedLine = setDefaultValues(currentLine);
      const response = await axios.put(`${API_URL}/api/telephone-lines/${currentLine.id}`, formattedLine, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedLine = response.data;
      const updatedData = originalData.map(line => line.id === updatedLine.id ? updatedLine : line);
      setOriginalData(updatedData);
      applyFilters(updatedData, filters);
      setIsEditing(false);
      setCurrentLine(null);
    } catch (error) {
      console.error('Error updating Telephone Line:', error.message);
      alert('Failed to update telephone line: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setCurrentLine(prevState => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setNewLine(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleDeleteLine = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/telephone-lines/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedData = originalData.filter(line => line.id !== id);
      setOriginalData(updatedData);
      applyFilters(updatedData, filters);
    } catch (error) {
      console.error('Error deleting Telephone Line:', error.message);
      alert('Failed to delete telephone line: ' + error.message);
    }
  };
  const columns = React.useMemo(() => [
    {
      Header: '#',
      accessor: (row, i) => (currentPage - 1) * rowsPerPage + i + 1,
      disableFilters: true,
      disableSortBy: true,
      width: 50, // Set a specific width if needed
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      disableFilters: true,
      disableSortBy: true,
      width: 120, // Set a specific width for the Actions column
      Cell: ({ row }) => (
        <div className="actions-column">
          <button className="modify-button" onClick={() => handleModifyLine(row.original)}>Modify</button>
          <button className="delete-button" onClick={() => handleDeleteLine(row.original.id)}>Delete</button>
        </div>
      ),
    },
    ...Object.keys(newLine).map((key) => ({
      Header: getCustomHeaderName(key),
      accessor: key,
      Filter: ({ column }) => (
        <SelectColumnFilter
          column={column}
          options={options[key]}
          placeholder={`Filtrer par ${getCustomHeaderName(key)}`}
          handleFilterChange={handleFilterChange}
          handleRemoveFilter={handleRemoveFilter}
        />
      ),
    })),
  ], [newLine, currentPage, rowsPerPage, options, filters]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  return (
    <div className="telephone-line-manager">
      <button className="telephone-line-modify-back-button" onClick={() => history.goBack()}>
        &#x21a9;
      </button>
      <h1>GSM Manager</h1>
      <div className="add-line">
        <table className="form-table telephone-line-form-table">
          <tbody>
            {Object.keys(newLine).map((key, index) => (
              index % 3 === 0 && (
                <tr key={index}>
                  {Object.keys(newLine).slice(index, index + 3).map(innerKey => (
                    <td key={innerKey}>
                      <label className="telephone-line-form-label">{getCustomHeaderName(innerKey)}</label>
                      {['code_entite', 'direction', 'fonction', 'operateur', 'categorie', 'poste_GSM'].includes(innerKey) ? (
                        <CustomDropdown
                          name={innerKey}
                          value={isEditing ? currentLine[innerKey] : newLine[innerKey]}
                          options={options[innerKey] || []}
                          onChange={handleChange}
                          placeholder={`Entrer/Selectionner ${innerKey.replace(/_/g, ' ')}`}
                        />
                      ) : (
                        <input
                          type={innerKey.startsWith('date') ? 'date' : 'text'}
                          name={innerKey}
                          value={isEditing ? currentLine[innerKey] : newLine[innerKey]}
                          onChange={handleChange}
                          className="input-field"
                          placeholder={innerKey === 'numero_de_gsm' ? 'eg: 212XXXXXXXXX' : `Entrer ${innerKey.replace(/_/g, ' ')}`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )
            ))}
          </tbody>
        </table>
        {isEditing ? (
          <button className="update-button" onClick={handleUpdateLine}>Update Line</button>
        ) : (
          <button className="add-button" onClick={handleAddLine}>Add Line</button>
        )}
      </div>
      <div className="selected-filters">
        <h3>Filtres Sélectionnés:</h3>
        <div>
          {Object.keys(filters).map((key) => (
            filters[key].length > 0 && (
              <div key={key}>
                <strong>{getCustomHeaderName(key)}:</strong> {filters[key].map((value) => (
                  <span key={value} className="filter-badge">
                    {value} <button onClick={() => handleRemoveFilter(key, value)}>x</button>
                  </span>
                ))}
              </div>
            )
          ))}
        </div>
      </div>
      <div className="table-container">
        <Table columns={columns} data={paginatedData} />
      </div>
      <div className="pagination-controls">
        <button onClick={() => paginate(1)} disabled={currentPage === 1}>{'<<'}</button>
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>{'Précédent'}</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>{'Suivant'}</button>
        <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>{'>>'}</button>
        <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>
    </div>
  );
};

const SelectColumnFilter = ({ column: { filterValue, setFilter, id }, options = [], placeholder, handleFilterChange, handleRemoveFilter }) => {
  const filterOptions = options.map(option => ({ value: option.value, label: option.label }));

  const handleChange = (selectedOptions) => {
    setFilter(selectedOptions ? selectedOptions.map(option => option.value) : undefined);
    handleFilterChange(id, selectedOptions); // Call handleFilterChange to update filters
  };

  return (
    <div>
      <Select
        value={filterOptions.filter(option => filterValue && filterValue.includes(option.value))}
        onChange={handleChange}
        options={filterOptions}
        isMulti
        placeholder={placeholder || 'Filter...'}
        className="filter-select"
        classNamePrefix="filter-select"
      />
      <div className="selected-values">
        {filterValue && filterValue.map(value => (
          <span key={value} className="filter-badge">
            {value} <button onClick={() => handleRemoveFilter(id, value)}>x</button>
          </span>
        ))}
      </div>
    </div>
  );
};

const Table = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      disableMultiSort: false
    },
    useFilters,
    useSortBy
  );

  return (
    <table {...getTableProps()} className="data-table telephone-line-view-data-table">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                <div>
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} className={index % 2 === 0 ? "telephone-line-view-row-even" : "telephone-line-view-row-odd"}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const CustomDropdown = ({ name, value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className="dropdown-arrow" onClick={() => setIsOpen(!isOpen)}>
        ▼
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <div key={index} className="dropdown-option" onClick={() => handleSelect(option)}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TelephoneLine;
