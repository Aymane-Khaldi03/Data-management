import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useTable, usePagination, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import './ExcelEditor.css';

const ExcelEditor = () => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [workbook, setWorkbook] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const newWorkbook = XLSX.read(binaryStr, { type: 'binary' });

      const sheetNames = newWorkbook.SheetNames.map((sheetName, index) => ({
        value: index,
        label: sheetName,
      }));
      setSheets(sheetNames);
      setWorkbook(newWorkbook);
      setSelectedSheet(sheetNames[0].value);

      handleSheetChange(newWorkbook, sheetNames[0].value);
    };
    reader.readAsBinaryString(file);
  };

  const handleSheetChange = (workbook, sheetIndex) => {
    const sheetName = workbook.SheetNames[sheetIndex];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 });
    const [headers, ...rows] = jsonData;

    const cols = headers.map((header, index) => ({
      Header: header || `Column ${index + 1}`,
      accessor: `col${index}`,
      Cell: EditableCell,
    }));

    const formattedData = rows.map((row) => {
      const rowData = {};
      row.forEach((cell, index) => {
        rowData[`col${index}`] = cell;
      });
      return rowData;
    });

    setColumns(cols);
    setData(formattedData);
  };

  const handleSheetSelect = (selectedOption) => {
    setSelectedSheet(selectedOption.value);
    if (workbook) {
      handleSheetChange(workbook, selectedOption.value);
    }
  };

  const handleCellChange = (rowIndex, columnId, value) => {
    const updatedData = data.map((row, index) => {
      if (index === rowIndex) {
        return {
          ...row,
          [columnId]: value,
        };
      }
      return row;
    });
    setData(updatedData);
  };

  const handleAddRow = (position) => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.accessor] = '';
    });
    let updatedData = [...data];
    if (position === 'above') {
      selectedRows.forEach(rowIndex => {
        updatedData = [
          ...updatedData.slice(0, rowIndex),
          newRow,
          ...updatedData.slice(rowIndex),
        ];
      });
    } else if (position === 'below') {
      selectedRows.reverse().forEach(rowIndex => {
        updatedData = [
          ...updatedData.slice(0, rowIndex + 1),
          newRow,
          ...updatedData.slice(rowIndex + 1),
        ];
      });
    }
    setSelectedRows([]);
    setData(updatedData);
  };

  const handleDeleteRow = () => {
    const updatedData = data.filter((_, index) => !selectedRows.includes(index));
    setSelectedRows([]);
    setData(updatedData);
  };

  const handleSelectRow = (rowIndex) => {
    if (selectedRows.includes(rowIndex)) {
      setSelectedRows(selectedRows.filter(index => index !== rowIndex));
    } else {
      setSelectedRows([...selectedRows, rowIndex]);
    }
  };

  const downloadExcel = () => {
    const formattedData = data.map(row => {
      const rowData = {};
      columns.forEach(col => {
        rowData[col.Header] = row[col.accessor];
      });
      return rowData;
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_' + fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
        placeholder={`Filter by...`}
        className="filter-select"
      />
    );
  };

  const Table = ({ columns, data }) => {
    const defaultColumn = {
      Cell: EditableCell,
      Filter: SelectColumnFilter,
    };
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
      state: { pageIndex, pageSize },
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
      canNextPage,
      canPreviousPage,
      pageOptions,
      pageCount,
      page
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
      },
      useFilters,
      useSortBy,
      usePagination
    );

    return (
      <div className="table-container">
        <div className="table-actions">
          <button onClick={() => handleAddRow('above')} className="action-button">Add Row Above</button>
          <button onClick={() => handleAddRow('below')} className="action-button">Add Row Below</button>
          <button onClick={handleDeleteRow} className="action-button delete">Delete</button>
        </div>
        <table {...getTableProps()} className="data-table">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                <th className="select-row-container">Select Row</th>
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
            {page.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  <td className="select-row-container">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => handleSelectRow(rowIndex)}
                    />
                  </td>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>
          <span>
            Page{' '}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>{' '}
          </span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData,
    className,
  }) => {
    const [value, setValue] = React.useState(initialValue);
    const onChange = e => {
      setValue(e.target.value);
    };

    const onBlur = () => {
      updateMyData(index, id, value);
    };

    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return <input value={value} onChange={onChange} onBlur={onBlur} className={className} />;
  };

  return (
    <div className="excel-editor">
      <div className="file-upload-container">
        <input type="file" onChange={handleFileUpload} className="file-input" />
      </div>
      {sheets.length > 0 && (
        <Select
          value={sheets.find(sheet => sheet.value === selectedSheet)}
          onChange={handleSheetSelect}
          options={sheets}
          className="sheet-select"
        />
      )}
      {columns.length > 0 && (
        <Table columns={columns} data={data} />
      )}
      <button onClick={downloadExcel} className="download-button">Download Modified Excel</button>
    </div>
  );
};

export default ExcelEditor;
