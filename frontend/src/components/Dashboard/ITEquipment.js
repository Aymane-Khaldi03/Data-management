import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ITEquipment.css';

// Helper function to set default values
const setDefaultValues = (data, defaultValue = '------') => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (value === '' || value === null) {
        if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
          return [key, null];  // Set date fields to null if empty
        } else {
          return [key, defaultValue];  // Set other fields to default value
        }
      }
      return [key, value];
    })
  );
};

const formatDate = (dateString) => {
  if (!dateString || dateString === '------') return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const ITEquipment = () => {
  const [itEquipments, setITEquipments] = useState([]);
  const [options, setOptions] = useState({});
  const [newEquipment, setNewEquipment] = useState({
    categorie: '',
    marque: '',
    model: '',
    code_materiel: '',
    serie: '',
    code_localisation: '',
    code_entite: '',
    date_installation: '',
    fin_garantie: '',
    statut: '',
    type_acquisition: '',
    date_achat: '',
    date_livraison: '',
    fournisseur: '',
    numero_facture: '',
    prix_achat: '',
    numero_appel_offre: '',
    numero_livraison: '',
    cout_maintenance: '',
    emploi_principal: '',
    niveau_criticite: '',
    sla: '',
    date_sortie: '',
    commentaire: '',  // Add this field
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const history = useHistory();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(250); // Define the page size
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState([]);
  const [allITEquipments, setAllITEquipments] = useState([]); // Store all data for filtering and sorting
  const [selectedFilters, setSelectedFilters] = useState({}); // New state to store selected filters

  const fetchITEquipments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/it-equipments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setITEquipments(response.data.equipments);
      setTotalPages(Math.ceil(response.data.equipments.length / pageSize));
      setOptions(response.data.uniqueValues);
    } catch (error) {
      console.error('Error fetching IT Equipments:', error.message);
    }
  };

  const fetchAllITEquipments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/it-equipments/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allEquipments = response.data.equipments;
      setAllITEquipments(allEquipments);

      const uniqueValues = response.data.uniqueValues;
      setOptions(uniqueValues);
    } catch (error) {
      console.error('Error fetching all IT Equipments:', error.message);
    }
  };

  useEffect(() => {
    fetchAllITEquipments();
    fetchITEquipments();
  }, [currentPage, pageSize]);

  const handleAddEquipment = async () => {
    if (newEquipment.statut === 'REFORME' && !newEquipment.date_sortie) {
      alert('Le champ "date sortie" doit être rempli, si le statut est "REFORME".');
      return;
    }

    try {
      const formattedEquipment = setDefaultValues(newEquipment);
      console.log('Adding equipment:', formattedEquipment);
      const response = await axios.post('http://localhost:5000/api/it-equipments', formattedEquipment, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Response from server:', response.data);

      fetchAllITEquipments(); // Refresh the equipment list
      setNewEquipment({
        categorie: '',
        marque: '',
        model: '',
        code_materiel: '',
        serie: '',
        code_localisation: '',
        code_entite: '',
        date_installation: '',
        fin_garantie: '',
        statut: '',
        type_acquisition: '',
        date_achat: '',
        date_livraison: '',
        fournisseur: '',
        numero_facture: '',
        prix_achat: '',
        numero_appel_offre: '',
        numero_livraison: '',
        cout_maintenance: '',
        emploi_principal: '',
        niveau_criticite: '',
        sla: '',
        date_sortie: '',
        commentaire: '', // Reset this field
      });
      console.log('Equipment added successfully');
    } catch (error) {
      console.error('Error adding IT Equipment:', error);
    }
  };

  const handleDeleteEquipment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Token:', token);

      await axios.delete(`http://localhost:5000/api/it-equipments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllITEquipments((prevEquipments) => prevEquipments.filter(equipment => equipment.id !== id));
      setITEquipments((prevEquipments) => prevEquipments.filter(equipment => equipment.id !== id));
      console.log('Equipment deleted successfully');
    } catch (error) {
      console.error('Error deleting IT Equipment:', error.message);
    }
  };

  const handleModifyEquipment = (equipment) => {
    setIsEditing(true);
    setCurrentEquipment({
      ...equipment,
      date_installation: formatDate(equipment.date_installation),
      fin_garantie: formatDate(equipment.fin_garantie),
      date_achat: formatDate(equipment.date_achat),
      date_livraison: formatDate(equipment.date_livraison),
      date_sortie: formatDate(equipment.date_sortie),
    });
  };


  const handleUpdateEquipment = async () => {
    if (currentEquipment.statut === 'REFORME' && !currentEquipment.date_sortie) {
      alert('The "date sortie" field must be filled if the statut is "reforme".');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('Token:', token);

      const filteredEquipment = setDefaultValues(currentEquipment);
      console.log('Updating equipment:', filteredEquipment);
      const response = await axios.put(`http://localhost:5000/api/it-equipments/${currentEquipment.id}`, filteredEquipment, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Response from server:', response.data);
      fetchAllITEquipments(); // Refresh the equipment list
      setIsEditing(false);
      setCurrentEquipment(null);
      console.log('Equipment updated successfully');
    } catch (error) {
      console.error('Error updating IT Equipment:', error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setCurrentEquipment(prevState => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setNewEquipment(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (name, date) => {
    const formattedDate = date ? formatDate(date.toISOString()) : '';
    if (isEditing) {
      setCurrentEquipment(prevState => ({
        ...prevState,
        [name]: date ? formattedDate : null,
      }));
    } else {
      setNewEquipment(prevState => ({
        ...prevState,
        [name]: date ? formattedDate : null,
      }));
    }
  };



  const handleFilterChange = (id, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [id]: value,
    }));
    setSelectedFilters(prevSelected => ({
      ...prevSelected,
      [id]: value,
    }));
  };

  const filteredAndSortedData = React.useMemo(() => {
    let filteredData = allITEquipments;

    Object.keys(filters).forEach(id => {
      if (filters[id] && filters[id].length > 0) {
        filteredData = filteredData.filter(row => {
          const rowValue = row[id] != null ? row[id].toString().toLowerCase() : '';
          const filterValue = Array.isArray(filters[id]) ? filters[id][0].value : filters[id].value;

          if (filterValue != null) {
            return rowValue.includes(filterValue.toString().toLowerCase());
          }
          return true;
        });
      }
    });

    if (sortBy.length) {
      const sortByField = sortBy[0];
      filteredData = filteredData.sort((a, b) => {
        const aValue = a[sortByField.id] != null ? a[sortByField.id].toString() : '';
        const bValue = b[sortByField.id] != null ? b[sortByField.id].toString() : '';
        if (aValue < bValue) {
          return sortByField.desc ? 1 : -1;
        }
        if (aValue > bValue) {
          return sortByField.desc ? -1 : 1;
        }
        return 0;
      });
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [allITEquipments, filters, sortBy, currentPage, pageSize]);


  const data = React.useMemo(() => filteredAndSortedData.map((equipment, index) => ({
    rowNumber: (currentPage - 1) * pageSize + index + 1,
    actions: (
      <div>
        <button className="modify-button" onClick={() => handleModifyEquipment(equipment)}>Modify</button>
        <button className="delete-button" onClick={() => handleDeleteEquipment(equipment.id)}>Delete</button>
      </div>
    ),
    ...equipment,
  })), [filteredAndSortedData, currentPage, pageSize]);

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
    },
    ...Object.keys(newEquipment).map((key) => ({
      Header: key.replace(/_/g, ' '),
      accessor: key,
      Filter: ({ column: { filterValue, setFilter, id } }) => (
        <Select
          value={filterValue || ''}
          onChange={(value) => handleFilterChange(id, value)}
          options={options[id] ? options[id].map(option => ({ label: option.label, value: option.value })) : []}
          isMulti
          placeholder={`Filter by ${key.replace(/_/g, ' ')}`}
          className="filter-select"
        />
      ),
    })),
  ], [newEquipment, currentPage, pageSize, options, selectedFilters]);


  ////
  const handlePageNumberClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="it-equipment-manager">
      <button className="itequipment-modify-back-button" onClick={() => history.goBack()}>
        &#x21a9;
      </button>
      <h1>IT Equipment Manager</h1>
      <div className="add-equipment">
        <table className="form-table">
          <tbody>
            <tr>
              <td>
                <label>categorie</label>
                <CustomDropdown
                  name="categorie"
                  value={isEditing ? currentEquipment.categorie : newEquipment.categorie}
                  options={options.categorie || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner la categorie" // Custom placeholder
                />
              </td>
              <td>
                <label>marque</label>
                <CustomDropdown
                  name="marque"
                  value={isEditing ? currentEquipment.marque : newEquipment.marque}
                  options={options.marque || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner la marque" // Custom placeholder
                />
              </td>
              <td>
                <label>model</label>
                <CustomDropdown
                  name="model"
                  value={isEditing ? currentEquipment.model : newEquipment.model}
                  options={options.model || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le model" // Custom placeholder
                />
              </td>
              <td>
                <label>code materiel</label>
                <CustomDropdown
                  name="code_materiel"
                  value={isEditing ? currentEquipment.code_materiel : newEquipment.code_materiel}
                  options={options.code_materiel || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le code de materiel"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>serie</label>
                <CustomDropdown
                  name="serie"
                  value={isEditing ? currentEquipment.serie : newEquipment.serie}
                  options={options.serie || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner la serie" // Custom placeholder
                />
              </td>
              <td>
                <label>code localisation</label>
                <CustomDropdown
                  name="code_localisation"
                  value={isEditing ? currentEquipment.code_localisation : newEquipment.code_localisation}
                  options={options.code_localisation || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le code de localisation" // Custom placeholder
                />
              </td>
              <td>
                <label>code entite</label>
                <CustomDropdown
                  name="code_entite"
                  value={isEditing ? currentEquipment.code_entite : newEquipment.code_entite}
                  options={options.code_entite || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le code d'entite" // Custom placeholder
                />
              </td>
              <td>
                <label>date installation</label>
                <input
                  type="date"
                  name="date_installation"
                  value={isEditing ? formatDate(currentEquipment.date_installation) : newEquipment.date_installation}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="YYYY-MM-DD"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>fin garantie</label>
                <input
                  type="date"
                  name="fin_garantie"
                  value={isEditing ? formatDate(currentEquipment.fin_garantie) : newEquipment.fin_garantie}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="YYYY-MM-DD"
                />
              </td>
              <td>
                <label>statut</label>
                <CustomDropdown
                  name="statut"
                  value={isEditing ? currentEquipment.statut : newEquipment.statut}
                  options={options.statut || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le status" // Custom placeholder
                />
              </td>
              <td>
                <label>type acquisition</label>
                <CustomDropdown
                  name="type_acquisition"
                  value={isEditing ? currentEquipment.type_acquisition : newEquipment.type_acquisition}
                  options={options.type_acquisition || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le type d'acquisition" // Custom placeholder
                />
              </td>
              <td>
                <label>date achat</label>
                <input
                  type="date"
                  name="date_achat"
                  value={isEditing ? formatDate(currentEquipment.date_achat) : newEquipment.date_achat}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="YYYY-MM-DD"
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>date livraison</label>
                <input
                  type="date"
                  name="date_livraison"
                  value={isEditing ? formatDate(currentEquipment.date_livraison) : newEquipment.date_livraison}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="YYYY-MM-DD"
                />
              </td>
              <td>
                <label>fournisseur</label>
                <CustomDropdown
                  name="fournisseur"
                  value={isEditing ? currentEquipment.fournisseur : newEquipment.fournisseur}
                  options={options.fournisseur || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le fournisseur" // Custom placeholder
                />
              </td>
              <td>
                <label>numero facture</label>
                <input
                  type="text"
                  name="numero_facture"
                  value={isEditing ? currentEquipment.numero_facture : newEquipment.numero_facture}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer le numero de facture" // Custom placeholder
                />
              </td>
              <td>
                <label>prix achat</label>
                <input
                  type="text"
                  name="prix_achat"
                  value={isEditing ? currentEquipment.prix_achat : newEquipment.prix_achat}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer le prix achat" // Custom placeholder
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>numero appel offre</label>
                <input
                  type="text"
                  name="numero_appel_offre"
                  value={isEditing ? currentEquipment.numero_appel_offre : newEquipment.numero_appel_offre}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer le numero d'appel offre" // Custom placeholder
                />
              </td>
              <td>
                <label>numero livraison</label>
                <input
                  type="text"
                  name="numero_livraison"
                  value={isEditing ? currentEquipment.numero_livraison : newEquipment.numero_livraison}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer le numero de livraison" // Custom placeholder
                />
              </td>
              <td>
                <label>cout maintenance</label>
                <input
                  type="text"
                  name="cout_maintenance"
                  value={isEditing ? currentEquipment.cout_maintenance : newEquipment.cout_maintenance}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer le cout de maintenance" // Custom placeholder
                />
              </td>
              <td>
                <label>emploi principal</label>
                <input
                  type="text"
                  name="emploi_principal"
                  value={isEditing ? currentEquipment.emploi_principal : newEquipment.emploi_principal}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer l'emploi principale" // Custom placeholder
                />
              </td>
            </tr>
            <tr>
              <td>
                <label>niveau criticite</label>
                <CustomDropdown
                  name="niveau_criticite"
                  value={isEditing ? currentEquipment.niveau_criticite : newEquipment.niveau_criticite}
                  options={options.niveau_criticite || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le niveau de criticité" // Custom placeholder
                />
              </td>
              <td>
                <label>sla</label>
                <CustomDropdown
                  name="sla"
                  value={isEditing ? currentEquipment.sla : newEquipment.sla}
                  options={options.sla || []}
                  onChange={handleChange}
                  placeholder="Entrer/Selectionner le SLA" // Custom placeholder
                />
              </td>
              <td>
                <label>date sortie</label>
                <input
                  type="date"
                  name="date_sortie"
                  value={isEditing ? formatDate(currentEquipment.date_sortie) : newEquipment.date_sortie}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="YYYY-MM-DD"
                />
              </td>
              <td>
                <label>commentaire</label>
                <input
                  type="text"
                  name="commentaire"
                  value={isEditing ? currentEquipment.commentaire : newEquipment.commentaire}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Entrer un commentaire" // Custom placeholder
                />
              </td>
            </tr>
          </tbody>
        </table>
        {isEditing ? (
          <button onClick={handleUpdateEquipment}>Update Equipment</button>
        ) : (
          <button onClick={handleAddEquipment}>Add Equipment</button>
        )}
      </div>
      <div className="itequipment-view-table-container">
        <Table columns={columns} data={data} />
      </div>
      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      <div className="page-number-navigation">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => handlePageNumberClick(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const SelectColumnFilter = ({ column: { filterValue, setFilter, id } }) => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    // Add more options as needed
  ];

  return (
    <Select
      value={filterValue || ''}
      onChange={(value) => setFilter(value || undefined)}
      options={options}
      isMulti
      placeholder="Filter by..."
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
    <table {...getTableProps()} className="data-table itequipment-view-data-table">
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
            <tr {...row.getRowProps()} className={index % 2 === 0 ? "itequipment-view-row-even" : "itequipment-view-row-odd"}>
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
  const [inputValue, setInputValue] = useState(value);

  const handleSelect = (option) => {
    setInputValue(option.label);
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange({ target: { name, value: e.target.value } });
    setIsOpen(true);
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="dropdown-container">
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        onClick={() => setIsOpen(!isOpen)}
      />
      <div className="dropdown-arrow" onClick={() => setIsOpen(!isOpen)}>
        ▼
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {filteredOptions.length === 0 ? (
            <div className="dropdown-option">No options available</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div key={index} className="dropdown-option" onClick={() => handleSelect(option)}>
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ITEquipment;