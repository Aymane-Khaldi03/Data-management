import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './ITEquipmentView.css';

const ITEquipmentView = () => {
  const [itEquipments, setITEquipments] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [viewType, setViewType] = useState('general'); // State to toggle between tables
  const history = useHistory();

  ////
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil(itEquipments.length / rowsPerPage));
  }, [itEquipments.length, rowsPerPage]);

  const handlePageNumberClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to the first page
  };

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return itEquipments.slice(startIndex, endIndex);
  }, [itEquipments, currentPage, rowsPerPage]);

  const columnsWithRowNumber = React.useMemo(() => {
    const rowNumberColumn = {
      Header: '#',
      id: 'rowNumber',
      accessor: (row, i) => (currentPage - 1) * rowsPerPage + i + 1,
      disableFilters: true,
      disableSortBy: true,
      width: 50,
    };

    const filteredColumns = columns.filter(col => col.Header !== '#');
    return [rowNumberColumn, ...filteredColumns];
  }, [columns, currentPage, rowsPerPage]);
  ////


  // Define measureTextWidth function
  const measureTextWidth = (text, font = '12px Arial') => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  };

  useEffect(() => {
    const fetchITEquipments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/it-equipments', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data && Array.isArray(response.data.equipments)) {
          const data = response.data.equipments.map(({ createdAt, updatedAt, id, ...rest }) => setDefaultValues(rest));
          console.log('Fetched data:', data); // Debug logging
          setITEquipments(data);
          setOriginalData(data); // Store the original data

          const headers = Object.keys(data[0] || {});
          const maxWidths = headers.reduce((acc, header) => {
            const headerWidth = measureTextWidth(header.replace(/_/g, ' '));
            const maxLength = Math.max(
              headerWidth,
              ...data.map(row => measureTextWidth(row[header] ? row[header].toString() : ''))
            );
            acc[header] = maxLength;
            return acc;
          }, {});

          const cols = [
            {
              Header: '#',
              accessor: (row, i) => i + 1,
              disableFilters: true,
              disableSortBy: true,
              width: 50, // Fixed width for the row number column
            },
            ...headers.map((header) => ({
              Header: header.replace(/_/g, ' '),
              accessor: header,
              Filter: SelectColumnFilter,
              width: maxWidths[header] + 20, // Add some padding
            })),
          ];

          setColumns(cols);
        } else {
          console.error('Unexpected response data format:', response.data);
          alert('Error fetching IT Equipments: Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching IT Equipments:', error);
        alert('Error fetching IT Equipments: ' + error.message);
      }
    };

    fetchITEquipments();
  }, []);

  const setDefaultValues = (data, defaultValue = '------') => {
    const updatedData = { ...data };
    for (let key in updatedData) {
      if (updatedData[key] === '' || updatedData[key] === null) {
        if (['date_installation', 'fin_garantie', 'date_achat', 'date_livraison', 'date_sortie'].includes(key)) {
          updatedData[key] = null;  // Set date fields to null if empty
        } else {
          updatedData[key] = defaultValue;  // Set other fields to default value
        }
      }
    }
    return updatedData;
  };

  const filterData = (data) => {
    return data.filter(item => {
      const requiredFields = ['categorie', 'marque', 'model', 'statut', 'type_acquisition'];
      return requiredFields.every(field => item[field] && item[field] !== '------');
    });
  };

  const SelectColumnFilter = ({
    column: { filterValue, setFilter, preFilteredRows, id },
  }) => {
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
        placeholder={'Filter by...'}
        className="itequipment-view-filter-select"
      />
    );
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ITEquipments");
    XLSX.writeFile(wb, "ITEquipments.xlsx");
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
      rows,
      prepareRow,
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
      },
      useFilters,
      useSortBy
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
            {rows.map((row, rowIndex) => {
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
      </div>
    );
  };

  return (
    <div className="itequipment-view-container">
      <button className="itequipment-view-back-button" onClick={() => history.push('/it-equipment')}>
        &#x21a9;
      </button>
      <h1 className="itequipment-view-title">Afficher IT Equipments</h1>
      <button
        className="itequipment-view-toggle-button"
        onClick={() => {
          if (viewType === 'general') {
            setViewType('filtered');
            const filtered = filterData(originalData);
            console.log('Filtered data to display:', filtered); // Additional debug logging
            setITEquipments(filtered);
          } else {
            setViewType('general');
            setITEquipments(originalData); // Restore the original data
          }
        }}
      >
        {viewType === 'general' ? 'Show Filtered Equipments' : 'Show General IT Equipments'}
      </button>
      {columns.length > 0 && (
        <Table
          columns={columnsWithRowNumber}
          data={paginatedData}
        />
      )}
      <div className="pagination-controls">
        <button onClick={() => handlePageNumberClick(1)} disabled={currentPage === 1}>{'<<'}</button>
        <button onClick={() => handlePageNumberClick(currentPage - 1)} disabled={currentPage === 1}>{'Précédent'}</button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => handlePageNumberClick(currentPage + 1)} disabled={currentPage === totalPages}>{'Suivant'}</button>
        <button onClick={() => handlePageNumberClick(totalPages)} disabled={currentPage === totalPages}>{'>>'}</button>
        <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
          <option value={10}>Show 10</option>
          <option value={25}>Show 25</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>
      <div className="itequipment-view-footer">
        <button
          className="itequipment-view-export-button"
          onClick={() => exportToExcel(viewType === 'general' ? itEquipments : filterData(itEquipments))}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default ITEquipmentView;
