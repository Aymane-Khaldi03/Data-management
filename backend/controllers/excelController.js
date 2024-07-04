// backend/controllers/excelController.js
const XLSX = require('xlsx');

exports.uploadExcel = (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;
    const workbook = XLSX.read(file.data, { type: 'buffer' });

    const sheetNames = workbook.SheetNames;
    const sheetsData = sheetNames.map((sheet) => ({
        sheetName: sheet,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[sheet]),
    }));

    res.json({ sheets: sheetsData });
};

exports.generateExcel = (req, res) => {
    const { sheets } = req.body;

    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="modified_data.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);
};
