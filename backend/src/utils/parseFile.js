const Papa = require("papaparse");
const XLSX = require("xlsx");
const fs = require("fs");
const parseFile = (filePath, mimetype) => {
  if (mimetype === "text/csv") {
    const csv = fs.readFileSync(filePath, "utf8");
    const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
    return data;
  }
  const wb = XLSX.readFile(filePath);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
};
module.exports = parseFile;
