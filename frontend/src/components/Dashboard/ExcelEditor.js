import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import 'react-virtualized/styles.css'; // Only import the styles you need
import './ExcelEditor.css';

const indexToColumnName = (index) => {
  let columnName = '';
  let dividend = index + 1;

  while (dividend > 0) {
    let modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
};

const ExcelEditor = () => {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [showRows, setShowRows] = useState(true); // State to control row visibility
  const [selectedColumnRows, setSelectedColumnRows] = useState({}); // Track selected rows for each column

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
      setWorkbook(newWorkbook); // Set the workbook state
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
      Header: header || `Column ${indexToColumnName(index)}`, // Handle empty headers
      accessor: `col${index}`,
      Filter: SelectColumnFilter,
      Cell: EditableCell,
      width: 150, // Default column width
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
    setShowRows(rows.length <= 100); // Set showRows based on the number of rows
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

  const handleAddRow = (position, isZoomed = false) => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.accessor] = '';
    });
    let updatedData = [...data];
    if (selectedColumn !== null && isZoomed) {
      // Column-specific row operations in zoomed view
      const rowsToAdd = selectedColumnRows[selectedColumn] || [];
      if (position === 'above') {
        rowsToAdd.forEach(rowIndex => {
          updatedData = [
            ...updatedData.slice(0, rowIndex),
            newRow,
            ...updatedData.slice(rowIndex),
          ];
        });
      } else if (position === 'below') {
        rowsToAdd.reverse().forEach(rowIndex => {
          updatedData = [
            ...updatedData.slice(0, rowIndex + 1),
            newRow,
            ...updatedData.slice(rowIndex + 1),
          ];
        });
      }
      setSelectedColumnRows({ ...selectedColumnRows, [selectedColumn]: [] });
    } else {
      // General row operations
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
    }

    setData(updatedData);
  };

  const handleDeleteRow = (isZoomed = false) => {
    let updatedData = [...data];
    if (selectedColumn !== null && isZoomed) {
      // Column-specific row operations in zoomed view
      const rowsToDelete = selectedColumnRows[selectedColumn] || [];
      updatedData = data.filter((_, index) => !rowsToDelete.includes(index));
      setSelectedColumnRows({ ...selectedColumnRows, [selectedColumn]: [] });
    } else {
      // General row operations
      updatedData = data.filter((_, index) => !selectedRows.includes(index));
      setSelectedRows([]);
    }

    setData(updatedData);
  };

  const handleSelectRow = (rowIndex) => {
    if (selectedRows.includes(rowIndex)) {
      setSelectedRows(selectedRows.filter(index => index !== rowIndex));
    } else {
      setSelectedRows([...selectedRows, rowIndex]);
    }
  };

  const handleSelectColumnRow = (columnId, rowIndex) => {
    setSelectedColumnRows(prevState => {
      const newSelectedColumnRows = { ...prevState };
      if (!newSelectedColumnRows[columnId]) {
        newSelectedColumnRows[columnId] = [];
      }
      if (newSelectedColumnRows[columnId].includes(rowIndex)) {
        newSelectedColumnRows[columnId] = newSelectedColumnRows[columnId].filter(index => index !== rowIndex);
      } else {
        newSelectedColumnRows[columnId].push(rowIndex);
      }
      return newSelectedColumnRows;
    });
  };

  const handleSelectColumn = (columnId) => {
    if (selectedColumn === columnId) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn(columnId);
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

  const Table = ({ columns, data, showRows }) => {
    const defaultColumn = {
      Cell: EditableCell,
      Filter: SelectColumnFilter,
      width: 150,
    };
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
      setFilter,
    } = useTable(
      {
        columns,
        data,
        defaultColumn,
        updateMyData: handleCellChange,
      },
      useFilters,
      useSortBy
    );

    const zoomedTableRef = useRef(null);
    const buttonsRef = useRef(null);

    useEffect(() => {
      const handleScroll = () => {
        const zoomedTable = zoomedTableRef.current;
        const buttons = buttonsRef.current;

        if (!zoomedTable || !buttons) return;

        const zoomedTableTop = zoomedTable.getBoundingClientRect().top + window.scrollY;
        const zoomedTableBottom = zoomedTable.getBoundingClientRect().bottom + window.scrollY;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > zoomedTableTop && scrollTop < zoomedTableBottom - buttons.offsetHeight) {
          buttons.style.position = 'fixed';
          buttons.style.top = '20px';
        } else {
          buttons.style.position = 'absolute';
          buttons.style.top = '20px';
        }
      };

      window.addEventListener('scroll', handleScroll);

      // Clean up event listener
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

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
                <th className="select-row-container">#</th> {/* Extra header for row numbers */}
                <th className="select-row-container">Select Row</th> {/* Extra header for checkboxes */}
                {headerGroup.headers.map((column, index) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    <div style={{ width: column.width }}>
                      {indexToColumnName(index)} {/* Use the helper function here */}
                      <div>{column.render('Header')}</div>
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                      <div>{column.canFilter ? column.render('Filter') : null}</div>
                      <div className="select-column-container">
                        <input
                          type="checkbox"
                          checked={selectedColumn === column.id}
                          onChange={() => handleSelectColumn(column.id)}
                        />
                        <span className="select-column-text">Select Column</span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {showRows && rows.map((row, rowIndex) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  <td className="select-row-container">{rowIndex + 1}</td> {/* Cell for row number */}
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
        {selectedColumn !== null && (
          <div className="zoomed-column" ref={zoomedTableRef}>
            <div className="zoomed-table-container">
              <div className="zoomed-table-actions" ref={buttonsRef}>
                <button onClick={() => handleAddRow('above', true)} className="action-button">Add Row Above</button>
                <button onClick={() => handleAddRow('below', true)} className="action-button">Add Row Below</button>
                <button onClick={() => handleDeleteRow(true)} className="action-button delete">Delete</button>
              </div>
              <h3 className="zoomed-table-title">{columns.find(col => col.accessor === selectedColumn).Header}</h3>
              <table className="zoomed-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Select Row</th>
                    <th>{columns.find(col => col.accessor === selectedColumn).Header}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        <td>{index + 1}</td>
                        <td className="select-row-container">
                          <input
                            type="checkbox"
                            checked={selectedColumnRows[selectedColumn]?.includes(index) || false}
                            onChange={() => handleSelectColumnRow(selectedColumn, index)}
                          />
                        </td>
                        <td>
                          <EditableCell
                            value={row.values[selectedColumn]}
                            row={{ index }}
                            column={{ id: selectedColumn }}
                            updateMyData={handleCellChange}
                            className="zoomed-input"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
        <Table columns={columns} data={data} showRows={showRows} />
      )}
      <button onClick={downloadExcel} className="download-button">Download Modified Excel</button>
    </div>
  );
};

export default ExcelEditor;