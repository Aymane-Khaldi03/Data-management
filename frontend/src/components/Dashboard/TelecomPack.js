import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import './TelecomPack.css';

const subfieldOptionsMap = {
  'DATA': ['VPNLL', 'VPLS', 'VPNADSL', 'ADSLSECOURS'],
  'VOIX': ['RTC', 'MARNIS'],
  'MOBILE': ['GSM'],
  'INTERNET': ['ADSL', '4G']
};

const formatDate = (dateString) => {
  if (!dateString || dateString === '------') return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatTelecomPackData = (pack) => {
  const formattedPack = setDefaultValues(pack);
  return {
    ...formattedPack,
    dateAbonnement: formatDate(formattedPack.dateAbonnement),
    dateReengagement: formatDate(formattedPack.dateReengagement),
    dateEtat: formatDate(formattedPack.dateEtat),
  };
};

const setDefaultValues = (data, defaultValue = '') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        return [key, defaultValue];
      }
      return [key, value];
    })
  );
};

const TelecomPack = () => {
  const [telecomPacks, setTelecomPacks] = useState([]);
  const [options, setOptions] = useState({
    entite: [],
    operateur: [],
    produit: ['DATA', 'VOIX', 'MOBILE', 'INTERNET'],
    etatAbonnement: [],
  });
  const [newPack, setNewPack] = useState({
    entite: '',
    operateur: '',
    produit: '',
    produit2: '',
    numero: '',
    etatAbonnement: '',
    dateAbonnement: '',
    dateReengagement: '',
    dateEtat: '',
    observation: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPack, setCurrentPack] = useState({
    entite: '',
    operateur: '',
    produit: '',
    produit2: '',
    numero: '',
    etatAbonnement: '',
    dateAbonnement: '',
    dateReengagement: '',
    dateEtat: '',
    observation: ''
  });
  const history = useHistory();
  const [subfieldOptions, setSubfieldOptions] = useState([]);
  const [subfield, setSubfield] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(250); // Define the page size
  const [totalPages, setTotalPages] = useState(1);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };
  
  const fetchDropdownOptions = async () => {
    try {
      const fields = ['entite', 'operateur', 'etatAbonnement'];
      const fetchedOptions = {};
      for (const field of fields) {
        const response = await axios.get(`http://localhost:5000/api/telecom-packs/dropdown/${field}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const uniqueValues = Array.from(new Set(response.data.filter(value => value !== '')));
        fetchedOptions[field] = uniqueValues;
      }

      fetchedOptions.produit = ['DATA', 'VOIX', 'MOBILE', 'INTERNET'];


      setOptions(fetchedOptions);
    } catch (error) {
      console.error('Error fetching dropdown options:', error.message);
      alert('Failed to fetch dropdown options: ' + error.message);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTelecomPacks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/telecom-packs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = response.data.map(formatTelecomPackData);
        // Sort the data by "entite" column
        data.sort((a, b) => {
          const entiteA = a.entite.match(/\d+/);
          const entiteB = b.entite.match(/\d+/);
          return entiteA - entiteB;
        });
        if (isMounted) {
          setTelecomPacks(data);
          setTotalPages(Math.ceil(data.length / pageSize));
        }
      } catch (error) {
        console.error('Error fetching Telecom Packs:', error.message);
        alert('Failed to fetch telecom packs: ' + error.message);
      }
    };

    fetchTelecomPacks();
    fetchDropdownOptions();
    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const handleAddPack = async () => {
    if (!newPack.entite) {
      alert('The "entite" field must be filled.');
      return;
    }
  
    try {
      const { produit, ...formattedPack } = setDefaultValues({ ...newPack });
      const response = await axios.post('http://localhost:5000/api/telecom-packs', formattedPack, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const addedPack = response.data;
      setTelecomPacks([...telecomPacks, addedPack]);
      setNewPack({
        entite: '',
        operateur: '',
        produit: '', // Keep this for frontend use
        produit2: '',
        numero: '',
        etatAbonnement: '',
        dateAbonnement: '',
        dateReengagement: '',
        dateEtat: '',
        observation: ''
      });
      setSubfield('');
      setSubfieldOptions([]);
      setTotalPages(Math.ceil([...telecomPacks, addedPack].length / pageSize));
    } catch (error) {
      console.error('Error adding Telecom Pack:', error.message);
      alert('Failed to add telecom pack: ' + error.message);
    }
  };

  const handleModifyPack = (pack) => {
    setIsEditing(true);
    setCurrentPack({
      ...pack,
      dateAbonnement: formatDate(pack.dateAbonnement),
      dateReengagement: formatDate(pack.dateReengagement),
      dateEtat: formatDate(pack.dateEtat),
    });
    const options = subfieldOptionsMap[pack.produit] || [];
    setSubfieldOptions(options);
    setSubfield(pack.produit2);
  };

  const handleUpdatePack = async () => {
    try {
      const { produit, ...formattedPack } = setDefaultValues({ ...currentPack }); // Exclude 'produit' from being sent
      const response = await axios.put(`http://localhost:5000/api/telecom-packs/${currentPack.id}`, formattedPack, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedPack = response.data;
      setTelecomPacks(telecomPacks.map(pack => pack.id === updatedPack.id ? updatedPack : pack));
      setIsEditing(false);
      setCurrentPack(null);
      setSubfield('');
      setSubfieldOptions([]);
      setTotalPages(Math.ceil(telecomPacks.length / pageSize));
    } catch (error) {
      console.error('Error updating Telecom Pack:', error.message);
      alert('Failed to update telecom pack: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setCurrentPack(prevState => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setNewPack(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleProduitChange = (e) => {
    const { value } = e.target;
    const options = subfieldOptionsMap[value] || [];
    setSubfieldOptions(options);
    setSubfield(''); // Reset subfield when produit changes
  
    if (isEditing) {
      setCurrentPack(prevState => ({
        ...prevState,
        produit: value, // Keep produit here
        produit2: '' // Reset produit2 when produit changes
      }));
    } else {
      setNewPack(prevState => ({
        ...prevState,
        produit: value, // Keep produit here
        produit2: '' // Reset produit2 when produit changes
      }));
    }
  };

  const handleSubfieldChange = (e) => {
    const { value } = e.target;
    if (isEditing) {
      setCurrentPack(prevState => ({
        ...prevState,
        produit2: value,
      }));
    } else {
      setNewPack(prevState => ({
        ...prevState,
        produit2: value,
      }));
    }
    setSubfield(value);
  };

  const handleDeletePack = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/telecom-packs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      // Use functional state update to ensure the latest state is used
      setTelecomPacks(prevTelecomPacks => {
        const updatedTelecomPacks = prevTelecomPacks.filter(pack => pack.id !== id);
        setTotalPages(Math.ceil(updatedTelecomPacks.length / pageSize));
  
        // Adjust currentPage if necessary
        if (currentPage > Math.ceil(updatedTelecomPacks.length / pageSize) && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
  
        return updatedTelecomPacks;
      });
    } catch (error) {
      console.error('Error deleting Telecom Pack:', error.message);
      alert('Failed to delete telecom pack: ' + error.message);
    }
  };
  

  const columns = React.useMemo(() => [
    {
      Header: '#',
      accessor: (row, i) => (currentPage - 1) * pageSize + i + 1,
      disableFilters: true,
      disableSortBy: true,
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      disableFilters: true,
      disableSortBy: true,
      Cell: ({ row }) => (
        <div>
          <button className="modify-button" onClick={() => handleModifyPack(row.original)}>Modify</button>
          <button className="delete-button" onClick={() => handleDeletePack(row.original.id)}>Delete</button>
        </div>
      ),
    },
    {
      Header: 'Entite',
      accessor: 'entite',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Operateur',
      accessor: 'operateur',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Sous-Produit',
      accessor: 'produit2',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Numero',
      accessor: 'numero',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Etat d\'Abonnement',
      accessor: 'etatAbonnement',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Date d\'Abonnement',
      accessor: 'dateAbonnement',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Date de Reengagement',
      accessor: 'dateReengagement',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Date d\'Etat',
      accessor: 'dateEtat',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
    {
      Header: 'Observation',
      accessor: 'observation',
      Filter: SelectColumnFilter,
      placeholder: 'Filtrer par'
    },
  ], [currentPage, pageSize]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return telecomPacks.slice(startIndex, endIndex);
  }, [telecomPacks, currentPage, pageSize]);  

  return (
    <div className="telecom-pack-manager">
      <button className="telecompack-modify-back-button" onClick={() => history.goBack()}>
        &#x21a9;
      </button>
      <h1>Telecom Pack Manager</h1>
      <div className="add-pack">
        <table className="form-table telecom-pack-form-table">
          <tbody>
            <tr>
              <td>
                <label className="telecom-pack-form-label">Entite</label>
                <CustomDropdown
                  name="entite"
                  value={isEditing ? currentPack.entite : newPack.entite}
                  options={options.entite || []}
                  onChange={handleChange}
                  placeholder="Selectionner Entite"
                />
              </td>
              <td>
                <label className="telecom-pack-form-label">Operateur</label>
                <CustomDropdown
                  name="operateur"
                  value={isEditing ? currentPack.operateur : newPack.operateur}
                  options={options.operateur || []}
                  onChange={handleChange}
                  placeholder="Selectionner Operateur"
                />
              </td>
              <td>
                <label className="telecom-pack-form-label">Produit</label>
                <CustomDropdown
                  name="produit"
                  value={isEditing ? currentPack.produit : newPack.produit}
                  options={options.produit || []}
                  onChange={handleProduitChange}
                  placeholder="Selectionner Produit"
                />
              </td>
            </tr>
            {(isEditing ? currentPack.produit : newPack.produit) && subfieldOptions.length > 0 && (
              <tr>
                <td colSpan="3">
                  <label className="telecom-pack-form-label">Sous-Produit</label>
                  <CustomDropdown
                    name="produit2"
                    value={isEditing ? currentPack.produit2 : subfield}
                    options={subfieldOptions}
                    onChange={handleSubfieldChange}
                    placeholder="Selectionner Produit2"
                  />
                </td>
              </tr>
            )}
            <tr>
              <td>
                <label className="telecom-pack-form-label">Numero de GSM</label>
                <input
                  type="text"
                  name="numero"
                  value={isEditing ? currentPack.numero : newPack.numero}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="eg: 212XXXXXXXXX"
                />
              </td>
              <td>
                <label className="telecom-pack-form-label">Etat d'abonnement</label>
                <CustomDropdown
                  name="etatAbonnement"
                  value={isEditing ? currentPack.etatAbonnement : newPack.etatAbonnement}
                  options={options.etatAbonnement || []}
                  onChange={handleChange}
                  placeholder="Selectionner Etat Abonnement"
                />
              </td>
              <td>
                <label className="telecom-pack-form-label">Date d'abonnement</label>
                <input
                  type="date"
                  name="dateAbonnement"
                  value={isEditing ? currentPack.dateAbonnement : newPack.dateAbonnement}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer dateAbonnement"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label className="telecom-pack-form-label">Date de reengagement</label>
                <input
                  type="date"
                  name="dateReengagement"
                  value={isEditing ? currentPack.dateReengagement : newPack.dateReengagement}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer dateReengagement"
                />
              </td>
              <td>
                <label className="telecom-pack-form-label">Date d'etat</label>
                <input
                  type="date"
                  name="dateEtat"
                  value={isEditing ? currentPack.dateEtat : newPack.dateEtat}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer date d'etat"
                />
              </td>
              <td>
                <label className="telecom-pack-form-label">Observation</label>
                <input
                  type="text"
                  name="observation"
                  value={isEditing ? currentPack.observation : newPack.observation}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer une observation"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button className="add-pack" onClick={isEditing ? handleUpdatePack : handleAddPack}>
          {isEditing ? 'Update Pack' : 'Add Pack'}
        </button>
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

const SelectColumnFilter = ({ column: { filterValue, setFilter, preFilteredRows, id, placeholder } }) => {
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
      placeholder={placeholder || 'Filter...'}
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
    },
    useFilters,
    useSortBy
  );

  return (
    <table {...getTableProps()} className="data-table telecompack-view-data-table">
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
            <tr {...row.getRowProps()} className={index % 2 === 0 ? "telecompack-view-row-even" : "telecompack-view-row-odd"}>
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

  const handleInputChange = (e) => {
    const { value } = e.target;
    onChange({ target: { name, value } });
  };

  return (
    <div className="dropdown-container">
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="input-field"
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

export default TelecomPack;
