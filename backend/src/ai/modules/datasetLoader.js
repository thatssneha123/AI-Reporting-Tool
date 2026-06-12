const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const XLSX = require("xlsx");

const {
  extractPdfText
} = require("../utils/pdfExtractor");

const {
  parseBillText
} = require("../utils/billParser");

async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", row => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function loadExcel(filePath) {
  const workbook =
    XLSX.readFile(filePath);

  const sheetName =
    workbook.SheetNames[0];

  return XLSX.utils.sheet_to_json(
    workbook.Sheets[sheetName]
  );
}

async function loadPDF(filePath) {
  const text =
    await extractPdfText(filePath);

  return parseBillText(text);
}

async function loadDataset(filePath) {
  const ext =
    path.extname(filePath)
      .toLowerCase();

  if (ext === ".csv") {
    return await loadCSV(filePath);
  }

  if (
    ext === ".xlsx" ||
    ext === ".xls"
  ) {
    return loadExcel(filePath);
  }

  if (ext === ".pdf") {
    return await loadPDF(filePath);
  }

  throw new Error(
    `Unsupported file type: ${ext}`
  );
}

module.exports = {
  loadDataset
};