import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import './TelephoneLine.css';

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
    // Add more mappings as needed
  };
  return customNames[header] || header.replace(/_/g, ' ');
};

const TelephoneLine = () => {
  const [telephoneLines, setTelephoneLines] = useState([]);
  const [options, setOptions] = useState({
    code_entite: [],
    direction: [],
    fonction: [],
    operateur: [],
    categorie: [],
  });
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
  const [pageSize] = useState(10); // Define the page size
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTelephoneLines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/telephone-lines', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data.map(line => setDefaultValues(line));
        setTelephoneLines(data);
        setTotalPages(Math.ceil(data.length / pageSize));
      } catch (error) {
        console.error('Error fetching Telephone Lines:', error.message);
        alert('Failed to fetch telephone lines: ' + error.message);
      }
    };

    const fetchDropdownOptions = async () => {
      try {
        const fields = ['direction', 'fonction', 'operateur', 'categorie', 'poste_GSM'];
        const fetchedOptions = {};
        for (const field of fields) {
          const response = await axios.get(`http://localhost:5000/api/telephone-lines/dropdown/${field}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          const uniqueValues = Array.from(new Set(response.data.filter(value => value !== '').concat('------')));
          fetchedOptions[field] = uniqueValues;
        }
        setOptions(fetchedOptions);
      } catch (error) {
        console.error('Error fetching dropdown options:', error.message);
        alert('Failed to fetch dropdown options: ' + error.message);
      }
    };

    fetchTelephoneLines();
    fetchDropdownOptions();
  }, [currentPage]);

  const handleAddLine = async () => {
    if (!newLine.numero_de_gsm) {
      alert('The "numero_de_gsm" field must be filled.');
      return;
    }

    try {
      const formattedLine = setDefaultValues(newLine);
      const response = await axios.post('http://localhost:5000/api/telephone-lines', formattedLine, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const addedLine = response.data;
      setTelephoneLines([...telephoneLines, addedLine]);
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
      setTotalPages(Math.ceil([...telephoneLines, addedLine].length / pageSize));
    } catch (error) {
      console.error('Error adding Telephone Line:', error.message);
      alert('Failed to add telephone line: ' + error.message);
    }
  };

  const handleDeleteLine = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/telephone-lines/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTelephoneLines((prevLines) => prevLines.filter(line => line.id !== id));
      setTotalPages(Math.ceil((telephoneLines.length - 1) / pageSize));
    } catch (error) {
      console.error('Error deleting Telephone Line:', error.message);
      alert('Failed to delete telephone line: ' + error.message);
    }
  };

  const handleModifyLine = (line) => {
    setIsEditing(true);
    setCurrentLine(line);
  };

  const handleUpdateLine = async () => {
    try {
      const formattedLine = setDefaultValues(currentLine);
      const response = await axios.put(`http://localhost:5000/api/telephone-lines/${currentLine.id}`, formattedLine, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedLine = response.data;
      setTelephoneLines(telephoneLines.map(line => line.id === updatedLine.id ? updatedLine : line));
      setIsEditing(false);
      setCurrentLine(null);
      setTotalPages(Math.ceil(telephoneLines.length / pageSize));
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

  const columns = React.useMemo(() => [
    {
      Header: '#',
      accessor: (row, i) => (currentPage - 1) * pageSize + i + 1,
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
      Filter: SelectColumnFilter,
    })),
  ], [newLine, currentPage, pageSize]);  

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return telephoneLines.slice(startIndex, endIndex);
  }, [telephoneLines, currentPage, pageSize]);

  return (
    <div className="telephone-line-manager">
      <button className="telephone-line-modify-back-button" onClick={() => history.goBack()}>
        &#x21a9;
      </button>
      <h1>Line Téléphonique Manager</h1>
      <div className="add-line">
        <table className="form-table telephone-line-form-table">
          <tbody>
            {Object.keys(newLine).map((key, index) => (
              index % 3 === 0 && (
                <tr key={index}>
                  {Object.keys(newLine).slice(index, index + 3).map(innerKey => (
                    <td key={innerKey}>
                      <label className="telephone-line-form-label">{getCustomHeaderName(innerKey)}</label>
                      {['direction', 'fonction', 'operateur', 'categorie', 'poste_GSM'].includes(innerKey) ? (
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
      <div className="table-container">
        <Table columns={columns} data={paginatedData} />
      </div>
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Précédent
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Suivant
        </button>
      </div>
      <div className="page-number-navigation">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const SelectColumnFilter = ({ column: { filterValue, setFilter, preFilteredRows, id } }) => {
  const options = React.useMemo(() => {
    const optionsSet = new Set();
    preFilteredRows.forEach(row => {
      optionsSet.add(row.values[id]);
    });
    return [...optionsSet].map(option => ({ value: option, label: option }));
  }, [id, preFilteredRows]);

  const handleChange = (selectedOptions) => {
    setFilter(selectedOptions ? selectedOptions.map(option => option.value) : undefined);
  };

  return (
    <Select
      value={options.filter(option => filterValue && filterValue.includes(option.value))}
      onChange={handleChange}
      options={options}
      isMulti
      placeholder="Filtrer par..."
      className="filter-select"
    />
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
    onChange({ target: { name, value: option } });
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
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TelephoneLine;
