import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './TelecomPackView.css';

const TelecomPackView = () => {
  const [telecomPacks, setTelecomPacks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [viewType, setViewType] = useState('general');
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
          if (['dateAbonnement', 'dateReengagement', 'dateEtat'].includes(key)) {
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
    if (!dateString) return '------';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
  };

  useEffect(() => {
    const fetchTelecomPacks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/telecom-packs', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = response.data.map(pack => {
          const {createdat, updatedat,id, ...rest } = pack; // Exclude createdAt and updatedAt here
          const formattedPack = setDefaultValues(rest);
          return {
            ...formattedPack,
            dateAbonnement: formatDate(formattedPack.dateAbonnement),
            dateReengagement: formatDate(formattedPack.dateReengagement),
            dateEtat: formatDate(formattedPack.dateEtat),
          };
        });

        setTelecomPacks(data);

        const headers = Object.keys(data[0] || {});
        const filteredHeaders = headers.filter(header => !['createdat', 'updatedat'].includes(header)); // Exclude createdAt and updatedAt here
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
            Header: header.replace(/_/g, ' '),
            accessor: header,
            Filter: SelectColumnFilter,
            width: maxWidths[header] + 20,
          })),
        ];

        setColumns(cols);
      } catch (error) {
        console.error('Error fetching Telecom Packs:', error);
        alert('Error fetching Telecom Packs: ' + error.message);
      }
    };

    fetchTelecomPacks();
  }, []);           

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
        className="telecompack-view-filter-select"
      />
    );
  };

  const filterData = (data) => {
    const filteredData = data.filter(item =>
      item.entite && item.entite !== '------' &&
      item.operateur && item.operateur !== '------' &&
      item.produit && item.produit !== '------' &&
      item.etatAbonnement && item.etatAbonnement !== '------'
    );
    return filteredData;
  };

  const exportToExcel = (data) => {
    const filteredData = data.map(({ createdat, updatedat,id, ...rest }) => rest); // Exclude createdAt and updatedAt here
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TelecomPacks");
    XLSX.writeFile(wb, "TelecomPacks.xlsx");
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
                <tr {...row.getRowProps()} className={rowIndex % 2 === 0 ? 'telecompack-view-row-even' : 'telecompack-view-row-odd'}>
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
    <div className="telecompack-view-container">
      <button className="telecompack-view-back-button" onClick={() => history.push('/telecom-packs')}>
        &#x21a9;
      </button>
      <h1 className="telecompack-view-title">Afficher Telecom Packs</h1>
      {columns.length > 0 && (
        <Table
          columns={columns}
          data={viewType === 'general' ? telecomPacks : filterData(telecomPacks)}
        />
      )}
      <div className="telecompack-view-footer">
        <button
          className="telecompack-view-export-button"
          onClick={() => exportToExcel(viewType === 'general' ? telecomPacks : filterData(telecomPacks))}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default TelecomPackView;
