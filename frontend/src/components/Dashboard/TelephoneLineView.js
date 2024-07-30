import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa'; // Import icons
import './TelephoneLineView.css';

const TelephoneLineView = () => {
  const [telephoneLines, setTelephoneLines] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [uniqueValues, setUniqueValues] = useState({});
  const [filters, setFilters] = useState({});
  const history = useHistory();

  const fetchTelephoneLines = async (appliedFilters = {}) => {
    try {
      const response = await axios.get('http://localhost:5000/api/telephone-lines', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: appliedFilters, // Send filters as query params
      });

      const data = response.data.map(({ createdAt, updatedAt, id, ...rest }) => setDefaultValues(rest));
      setTelephoneLines(data);
      setOriginalData(data);

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
          Header: getCustomHeaderName(header),
          accessor: header,
          Filter: props => <SelectColumnFilter {...props} originalData={data} uniqueValues={uniqueValues[header]} />,
        })),
      ];

      setColumns(cols);
      setUniqueValues(uniqueValues);
    } catch (error) {
      console.error('Error fetching Telephone Lines:', error);
      alert('Error fetching Telephone Lines: ' + error.message);
    }
  };

  useEffect(() => {
    fetchTelephoneLines(filters);
  }, [filters]);

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
      code_entite: 'Code Entite',
      direction: 'Direction',
      fonction: 'Fonction',
      operateur: 'Opérateur',
      categorie: 'Catégorie',
      poste_GSM: 'Poste GSM',
      // Add more mappings as needed
    };
    return customNames[header] || header.replace(/_/g, ' ');
  };

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
      <div className="telephoneline-view-table-container">
        <table {...getTableProps()} className="telephoneline-view-data-table">
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
                <tr {...row.getRowProps()} className={rowIndex % 2 === 0 ? 'telephoneline-view-row-even' : 'telephoneline-view-row-odd'}>
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
    XLSX.utils.book_append_sheet(wb, ws, "TelephoneLines");
    XLSX.writeFile(wb, "TelephoneLines.xlsx");
  };

  return (
    <div className="telephoneline-view-container">
      <button className="telephoneline-view-back-button" onClick={() => history.push('/telephone-lines')}>
        &#x21a9;
      </button>
      <h1 className="telephoneline-view-title">Afficher Line Téléphonique</h1>
      <div className="telephoneline-view-selected-filters-container">
        {Object.keys(filters).map((filterKey) => (
          filters[filterKey].map((filterValue, index) => (
            <span key={`${filterKey}-${index}`} className="telephoneline-view-filter-chip">
              {`${filterKey}: ${filterValue}`} <button onClick={() => handleDelete(filterKey, filterValue)}>x</button>
            </span>
          ))
        ))}
      </div>
      {columns.length > 0 && (
        <Table
          columns={columns}
          data={originalData}
        />
      )}
      <div className="telephoneline-view-footer">
        <button
          className="telephoneline-view-export-button"
          onClick={() => exportToExcel(originalData)}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

const SelectColumnFilter = ({
  column: { filterValue = [], setFilter, id },
  uniqueValues
}) => {
  const [selectedOptions, setSelectedOptions] = useState(() => 
    filterValue.map(val => ({ value: val, label: val }))
  );

  const handleChange = (selected) => {
    const values = selected ? selected.map(option => option.value) : [];
    setSelectedOptions(selected);
    setFilter(values.length ? values : undefined); // Use undefined to clear the filter
  };

  const handleDelete = (filterKey, value) => {
    const updatedOptions = selectedOptions.filter(option => option.value !== value);
    const values = updatedOptions.map(option => option.value);
    setSelectedOptions(updatedOptions);
    setFilter(values.length ? values : undefined); // Use undefined to clear the filter
  };

  return (
    <div className="telephoneline-view-filter-container">
      <Select
        value={selectedOptions}
        onChange={handleChange}
        options={uniqueValues}
        isMulti
        placeholder={'Filter by...'}
        className="telephoneline-view-filter-select"
      />
      {selectedOptions.length > 0 && (
        <div className="telephoneline-view-selected-filters">
          {selectedOptions.map((option, index) => (
            <span key={index} className="telephoneline-view-filter-chip">
              {option.value} <button onClick={() => handleDelete(id, option.value)}>x</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TelephoneLineView;
