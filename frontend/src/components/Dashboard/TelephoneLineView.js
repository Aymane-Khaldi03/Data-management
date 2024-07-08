import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './TelephoneLineView.css';

const TelephoneLineView = () => {
  const [telephoneLines, setTelephoneLines] = useState([]);
  const [columns, setColumns] = useState([]);
  const history = useHistory();

  const measureTextWidth = (text, font = '12px Arial') => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  };

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

  useEffect(() => {
    const fetchTelephoneLines = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/telephone-lines', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = response.data.map(line => {
          const { createdAt, updatedAt, id, ...rest } = line; // Exclude createdAt and updatedAt here
          return setDefaultValues(rest);
        });

        setTelephoneLines(data);

        const headers = Object.keys(data[0] || {});
        const filteredHeaders = headers.filter(header => !['createdAt', 'updatedAt'].includes(header)); // Exclude createdAt and updatedAt here
        const maxWidths = filteredHeaders.reduce((acc, header) => {
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
            width: 50,
          },
          ...filteredHeaders.map((header) => ({
            Header: getCustomHeaderName(header),
            accessor: header,
            Filter: SelectColumnFilter,
            width: maxWidths[header] + 20,
          })),
        ];

        setColumns(cols);
      } catch (error) {
        console.error('Error fetching Telephone Lines:', error);
        alert('Error fetching Telephone Lines: ' + error.message);
      }
    };

    fetchTelephoneLines();
  }, []);

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
        className="telephoneline-view-filter-select"
        value={options.filter(option => filterValue && filterValue.includes(option.value))}
        onChange={handleChange}
        options={options}
        isMulti
        placeholder={'Filtrer par...'}
      />
    );
  };

  const exportToExcel = (data) => {
    const filteredData = data.map(({ createdAt, updatedAt, id, ...rest }) => rest); // Exclude createdAt and updatedAt here
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TelephoneLines");
    XLSX.writeFile(wb, "TelephoneLines.xlsx");
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
                <tr {...row.getRowProps()} className={rowIndex % 2 === 0 ? 'telephoneline-view-row-even' : 'telephoneline-view-row-odd'}>
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
    <div className="telephoneline-view-container">
      <button className="telephoneline-view-back-button" onClick={() => history.push('/telephone-lines')}>
        &#x21a9;
      </button>
      <h1 className="telephoneline-view-title">Afficher Line Téléphonique</h1>
      {columns.length > 0 && (
        <Table
          columns={columns}
          data={telephoneLines}
        />
      )}
      <div className="telephoneline-view-footer">
        <button
          className="telephoneline-view-export-button"
          onClick={() => exportToExcel(telephoneLines)}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default TelephoneLineView;
