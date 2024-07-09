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
  if (!dateString) return '';
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
  const [currentPack, setCurrentPack] = useState(null);
  const history = useHistory();
  const [subfieldOptions, setSubfieldOptions] = useState([]);
  const [subfield, setSubfield] = useState('');

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
        if (isMounted) setTelecomPacks(data);
      } catch (error) {
        console.error('Error fetching Telecom Packs:', error.message);
        alert('Failed to fetch telecom packs: ' + error.message);
      }
    };

    const fetchDropdownOptions = async () => {
      try {
        const fields = ['entite', 'operateur', 'produit', 'etatAbonnement'];
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
        setOptions(fetchedOptions);
      } catch (error) {
        console.error('Error fetching dropdown options:', error.message);
        alert('Failed to fetch dropdown options: ' + error.message);
      }
    };

    fetchTelecomPacks();
    fetchDropdownOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddPack = async () => {
    if (!newPack.entite) {
      alert('The "entite" field must be filled.');
      return;
    }
  
    try {
      const formattedPack = setDefaultValues({ ...newPack });
      console.log('Adding pack with produit2:', formattedPack.produit2); // Debugging statement
      const response = await axios.post('http://localhost:5000/api/telecom-packs', formattedPack, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const addedPack = response.data;
      console.log('Added pack response:', addedPack); // Debugging statement
      setTelecomPacks([...telecomPacks, addedPack]);
      setNewPack({
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
      setSubfield('');
      setSubfieldOptions([]);
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
      const formattedPack = setDefaultValues({ ...currentPack });
      console.log('Updating pack with produit2:', formattedPack.produit2); // Debugging statement
      const response = await axios.put(`http://localhost:5000/api/telecom-packs/${currentPack.id}`, formattedPack, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const updatedPack = response.data;
      console.log('Updated pack response:', updatedPack); // Debugging statement
      setTelecomPacks(telecomPacks.map(pack => pack.id === updatedPack.id ? updatedPack : pack));
      setIsEditing(false);
      setCurrentPack(null);
      setSubfield('');
      setSubfieldOptions([]);
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
        produit: value,
        produit2: '' // Reset produit2 when produit changes
      }));
    } else {
      setNewPack(prevState => ({
        ...prevState,
        produit: value,
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
      setTelecomPacks(telecomPacks.filter(pack => pack.id !== id));
    } catch (error) {
      console.error('Error deleting Telecom Pack:', error.message);
      alert('Failed to delete telecom pack: ' + error.message);
    }
  };

  const columns = React.useMemo(() => [
    {
      Header: '#',
      accessor: (row, i) => i + 1,
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
      Header: 'entite',
      accessor: 'entite',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'operateur',
      accessor: 'operateur',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'produit',
      accessor: 'produit',
      Filter: SelectColumnFilter,
      Cell: ({ value }) => value || null,
    },
    {
      Header: 'produit2',
      accessor: 'produit2',
      Filter: SelectColumnFilter,
      Cell: ({ value }) => value || null,
    },
    {
      Header: 'numero',
      accessor: 'numero',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'etatAbonnement',
      accessor: 'etatAbonnement',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'dateAbonnement',
      accessor: 'dateAbonnement',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'dateReengagement',
      accessor: 'dateReengagement',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'dateEtat',
      accessor: 'dateEtat',
      Filter: SelectColumnFilter,
    },
    {
      Header: 'observation',
      accessor: 'observation',
      Filter: SelectColumnFilter,
    },
  ], []);

  const data = React.useMemo(() => telecomPacks, [telecomPacks]);

  return (
    <div className="telecom-pack-manager">
      <button className="telecompack-modify-back-button" onClick={() => history.goBack()}>
        &#x21a9;
      </button>
      <h1>Telecom Pack Manager</h1>
      <div className="add-pack">
        <table className="form-table telecom-pack-form-table">
          <tbody>
            {Object.keys(newPack).map((key, index) => (
              index % 3 === 0 && key !== 'produit2' && ( // Remove produit2 from the map
                <tr key={index}>
                  {Object.keys(newPack).slice(index, index + 3).map(innerKey => (
                    innerKey !== 'produit2' && ( // Remove produit2 from the map
                      <td key={innerKey}>
                        <label className="telecom-pack-form-label">{innerKey.replace(/_/g, ' ')}</label>
                        {['entite', 'operateur', 'produit', 'etatAbonnement'].includes(innerKey) ? (
                          <CustomDropdown
                            name={innerKey}
                            value={isEditing ? currentPack[innerKey] : newPack[innerKey]}
                            options={options[innerKey] || []}
                            onChange={innerKey === 'produit' ? handleProduitChange : handleChange}
                            isProduit={innerKey === 'produit'}
                          />
                        ) : (
                          <input
                            type={innerKey.startsWith('date') ? 'date' : 'text'}
                            name={innerKey}
                            value={isEditing ? currentPack[innerKey] : newPack[innerKey]}
                            onChange={handleChange}
                            className="input-field"
                            placeholder={innerKey === 'numero' ? 'eg: 212XXXXXXXXX' : `Entrer ${innerKey.replace(/_/g, ' ')}`}
                          />
                        )}
                      </td>
                    )
                  ))}
                </tr>
              )
            ))}

            {(isEditing ? currentPack.produit : newPack.produit) && subfieldOptions.length > 0 && (
              <>
                <tr>
                  <td colSpan="3">
                    <label className="telecom-pack-form-label">Produit2</label>
                    <CustomDropdown
                      name="produit2"
                      value={isEditing ? currentPack.produit2 : subfield}
                      options={subfieldOptions}
                      onChange={handleSubfieldChange}
                      placeholder="Select Produit2"
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        {isEditing ? (
          <button className="update-button" onClick={handleUpdatePack}>Update Pack</button>
        ) : (
          <button className="add-button" onClick={handleAddPack}>Add Pack</button>
        )}
      </div>

      <div className="table-container">
        {telecomPacks.length > 0 ? (
          <Table columns={columns} data={telecomPacks} />
        ) : (
          <div>Loading...</div>
        )}
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
      disableMultiSort: false // Allow multiple column sorting
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
