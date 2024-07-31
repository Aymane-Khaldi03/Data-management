import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa'; // Import icons
import './TelecomPackView.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TelecomPackView = () => {
  const [telecomPacks, setTelecomPacks] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [uniqueValues, setUniqueValues] = useState({});
  const [filters, setFilters] = useState({});
  const history = useHistory();

  const fetchTelecomPacks = async (appliedFilters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/api/telecom-packs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        params: appliedFilters, // Send filters as query params
      });

      const data = response.data.map(({ createdAt, updatedAt, id, ...rest }) => setDefaultValues(rest));
      setTelecomPacks(data);
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
          Header: header.replace(/_/g, ' '),
          accessor: header,
          Filter: props => <SelectColumnFilter {...props} originalData={data} uniqueValues={uniqueValues[header]} />,
        })),
      ];

      setColumns(cols);
      setUniqueValues(uniqueValues);
    } catch (error) {
      console.error('Error fetching Telecom Packs:', error);
      alert('Error fetching Telecom Packs: ' + error.message);
    }
  };

  useEffect(() => {
    fetchTelecomPacks(filters);
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
      <div className="telecompack-view-table-container">
        <table {...getTableProps()} className="telecompack-view-data-table">
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
                <tr {...row.getRowProps()} className={rowIndex % 2 === 0 ? 'telecompack-view-row-even' : 'telecompack-view-row-odd'}>
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
    XLSX.utils.book_append_sheet(wb, ws, "TelecomPacks");
    XLSX.writeFile(wb, "TelecomPacks.xlsx");
  };

  return (
    <div className="telecompack-view-container">
      <button className="telecompack-view-back-button" onClick={() => history.push('/telecom-packs')}>
        &#x21a9;
      </button>
      <h1 className="telecompack-view-title">Afficher Parc Telecom</h1>
      <div className="telecompack-view-selected-filters-container">
        {Object.keys(filters).map((filterKey) => (
          filters[filterKey].map((filterValue, index) => (
            <span key={`${filterKey}-${index}`} className="telecompack-view-filter-chip">
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
      <div className="telecompack-view-footer">
        <button
          className="telecompack-view-export-button"
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
    <div className="telecompack-view-filter-container">
      <Select
        value={selectedOptions}
        onChange={handleChange}
        options={uniqueValues}
        isMulti
        placeholder={'Filtrer par...'}
        className="telecompack-view-filter-select"
      />
      {selectedOptions.length > 0 && (
        <div className="telecompack-view-selected-filters">
          {selectedOptions.map((option, index) => (
            <span key={index} className="telecompack-view-filter-chip">
              {option.value} <button onClick={() => handleDelete(id, option.value)}>x</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TelecomPackView;
