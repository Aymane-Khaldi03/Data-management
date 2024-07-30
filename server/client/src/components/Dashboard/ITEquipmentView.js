import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import './ITEquipmentView.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ITEquipmentView = () => {
  const [itEquipments, setITEquipments] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [uniqueValues, setUniqueValues] = useState({});
  const [filters, setFilters] = useState({});
  const history = useHistory();

  useEffect(() => {
    fetchITEquipments();
  }, []);

  const setDefaultValues = (data, defaultValue = '------', defaultNumber = 0) => {
    const updatedData = { ...data };
    for (let key in updatedData) {
      if (updatedData[key] === '' || updatedData[key] === null) {
        if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
          updatedData[key] = null;
        } else if (key === 'prix_achat') {
          updatedData[key] = defaultNumber;
        } else {
          updatedData[key] = defaultValue;
        }
      }
    }
    return updatedData;
  };

  const applyFilters = (data, filters) => {
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        if (!filters[key].length) return true;
        return filters[key].includes(item[key]);
      });
    });
  };

  const fetchITEquipments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/it-equipments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data && Array.isArray(response.data.equipments)) {
        const data = response.data.equipments.map(({ createdAt, updatedAt, id, ...rest }) => setDefaultValues(rest));
        setOriginalData(data);  // Save original data for filtering

        const headers = Object.keys(data[0] || {});
        const uniqueValues = {};

        headers.forEach(header => {
          uniqueValues[header] = [...new Set(data.map(item => item[header]))].map(value => ({ value, label: value }));
        });

        const cols = [
          {
            Header: '#',
            accessor: (row, i) => i + 1,
            disableFilters: true,
            disableSortBy: true,
            width: 50,
          },
          ...headers.map((header) => ({
            Header: header.replace(/_/g, ' '),
            accessor: header,
            Filter: props => (
              <SelectColumnFilter
                {...props}
                uniqueValues={uniqueValues[header]}
                globalSetFilters={setFilters}
                originalData={data}
                setITEquipments={setITEquipments}
                applyFilters={applyFilters}
              />
            ),
          })),
        ];

        setColumns(cols);
        setUniqueValues(uniqueValues);
        setITEquipments(applyFilters(data, filters));  // Apply filters to the data
      } else {
        toast.error('Error fetching IT equipments');
      }
    } catch (error) {
      toast.error('Error fetching IT equipments: ' + error.message);
    }
  };

  useEffect(() => {
    if (originalData.length) {
      setITEquipments(applyFilters(originalData, filters));
    }
  }, [filters, originalData]);

  const handleDelete = (filterKey, value) => {
    setFilters(prev => {
      const updatedFilters = { ...prev };
      updatedFilters[filterKey] = updatedFilters[filterKey].filter(val => val !== value);
      if (updatedFilters[filterKey].length === 0) {
        delete updatedFilters[filterKey];
      }
      return updatedFilters;
    });
  };

  const Table = ({ columns, data }) => {
    const defaultColumn = {
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    };

    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      prepareRow,
      page,
      canPreviousPage,
      canNextPage,
      pageOptions,
      state: { pageIndex, pageSize },
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
        initialState: { pageIndex: 0 },
      },
      useFilters,
      useSortBy,
      usePagination
    );

    return (
      <div className="itequipment-view-table-container">
        <table {...getTableProps()} className="itequipment-view-data-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <div style={{ width: column.width }}>
                      {column.render('Header')}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FaSortDown />
                          ) : (
                            <FaSortUp />
                          )
                        ) : (
                          <FaSort />
                        )}
                      </span>
                      <div>
                        {column.canFilter ? column.render('Filter') : null}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className={rowIndex % 2 === 0 ? 'itequipment-view-row-even' : 'itequipment-view-row-odd'}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination-controls">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>{'<<'}</button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>{'Précédent'}</button>
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <button onClick={() => nextPage()} disabled={!canNextPage}>{'Suivant'}</button>
          <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>{'>>'}</button>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ITEquipments");
    XLSX.writeFile(wb, "ITEquipments.xlsx");
  };

  return (
    <div className="itequipment-view-container">
      <ToastContainer />
      <button className="itequipment-view-back-button" onClick={() => history.push('/it-equipment')}>
        &#x21a9;
      </button>
      <h1 className="itequipment-view-title">Afficher IT Equipments</h1>
      <div className="itequipment-view-selected-filters-container">
        <h3>Filtres Sélectionnés:</h3>
        {Object.keys(filters).map((filterKey) => (
          filters[filterKey].map((filterValue, index) => (
            <span key={`${filterKey}-${index}`} className="itequipment-view-filter-chip">
              {`${filterKey}: ${filterValue}`} <button onClick={() => handleDelete(filterKey, filterValue)}>x</button>
            </span>
          ))
        ))}
      </div>
      <div className="itequipment-view-filters-container">
        {columns.map(column => (
          column.canFilter ? (
            <div key={column.id} className="itequipment-view-filter">
              <label>{column.render('Header')}</label>
              {column.render('Filter')}
            </div>
          ) : null
        ))}
      </div>
      {columns.length > 0 && (
        <Table
          columns={columns}
          data={itEquipments}  // Use filtered data
        />
      )}
      <div className="itequipment-view-footer">
        <button
          className="itequipment-view-export-button"
          onClick={() => exportToExcel(itEquipments)}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

const SelectColumnFilter = ({
  column: { filterValue = [], setFilter, id },
  uniqueValues,
  globalSetFilters,
  originalData,  // Receive originalData as a prop
  setITEquipments,
  applyFilters,
}) => {
  const [selectedOptions, setSelectedOptions] = useState(() =>
    filterValue.map(val => ({ value: val, label: val }))
  );

  const handleChange = (selected) => {
    const values = selected ? selected.map(option => option.value) : [];
    setSelectedOptions(selected);
    setFilter(values.length ? values : undefined); // Use undefined to clear the filter
    globalSetFilters(prev => {
      const updatedFilters = { ...prev, [id]: values };
      setITEquipments(applyFilters(originalData, updatedFilters));  // Apply filters to the data
      return updatedFilters;
    });
  };

  return (
    <div className="itequipment-view-filter-container">
      <Select
        value={selectedOptions}
        onChange={handleChange}
        options={uniqueValues}
        isMulti
        placeholder={'Filter by...'}
        className="itequipment-view-filter-select"
      />
    </div>
  );
};

export default ITEquipmentView;
