import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

export default function DataTable({ data = [], title = "Analysis Results Table", locale = "en-US" }) {
  const rows = Array.isArray(data) ? data : [];
  const headers = Object.keys(rows[0] || {});
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: headers[0], direction: "asc" });

  const filteredRows = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(q)))
      : rows;

    return [...filtered].sort((a, b) => {
      const aValue = a[sort.key];
      const bValue = b[sort.key];
      const aNumber = Number(aValue);
      const bNumber = Number(bValue);
      const result = Number.isFinite(aNumber) && Number.isFinite(bNumber)
        ? aNumber - bNumber
        : String(aValue ?? "").localeCompare(String(bValue ?? ""));
      return sort.direction === "asc" ? result : -result;
    });
  }, [query, rows, sort]);

  const changeSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const exportCsv = () => {
    const csv = [
      headers.join(","),
      ...filteredRows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
    ].join("\n");
    downloadBlob(csv, "billinsight-analysis.csv", "text/csv;charset=utf-8;");
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");
    XLSX.writeFile(workbook, "billinsight-analysis.xlsx");
  };

  const exportPdf = () => {
    const html = `
      <html><head><title>BillInsight AI Report</title>
      <style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#0f172a}table{width:100%;border-collapse:collapse}th,td{border:1px solid #e2e8f0;padding:10px;text-align:left}th{background:#f8fafc}</style>
      </head><body><h1>${title}</h1><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${filteredRows.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>
    `;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.print();
  };

  if (!rows.length) {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border-2 border-[var(--border)] bg-[var(--accent-2)] text-sm font-black text-white shadow-[2px_2px_0_rgba(17,24,39,0.9)]">D</div>
        <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">No data yet</h3>
      </div>
    );
  }

  return (
    <section className="card p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="badge-accent inline-flex">Data</p>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="neo-input h-9 pl-9 pr-3 text-sm"
              placeholder="Search table..."
            />
          </div>
          <div className="flex overflow-hidden rounded-lg border-2 border-[var(--border)] shadow-[2px_2px_0_rgba(17,24,39,0.9)]">
            <button onClick={exportCsv} className="h-9 bg-[#dbeafe] px-4 text-xs font-bold text-[var(--text-primary)] hover:bg-[#bfdbfe]">CSV</button>
            <button onClick={exportExcel} className="h-9 border-l-2 border-[var(--border)] bg-[#dcfce7] px-4 text-xs font-bold text-[var(--text-primary)] hover:bg-[#bbf7d0]">Excel</button>
            <button onClick={exportPdf} className="h-9 border-l-2 border-[var(--border)] bg-[var(--accent)] px-4 text-xs font-bold text-white hover:bg-[#fb923c]">PDF</button>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead className="bg-[var(--bg-elevated)]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border-b border-[var(--border)] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                  <button onClick={() => changeSort(header)} className="flex items-center gap-2 hover:text-[var(--accent)]">
                    {header}
                    <span className="text-[var(--text-muted)]">{sort.key === header ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr key={`${rowIndex}-${JSON.stringify(row).slice(0, 20)}`} className="hover:bg-[var(--bg-elevated)]">
                {headers.map((header, index) => {
                  const value = row[header];
                  const isNumber = typeof value === "number" || Number.isFinite(Number(value));
                  return (
                    <td
                      key={`${header}-${rowIndex}`}
                      data-number={isNumber ? "true" : undefined}
                      className={`border-b border-[var(--border)] px-4 py-3 ${isNumber ? "text-xs text-[var(--text-secondary)]" : "text-sm text-[var(--text-secondary)]"} ${index === 0 ? "font-medium text-[var(--text-primary)]" : ""}`}
                    >
                      {index === 0 && rowIndex === 0 && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--success)]" />}
                      {formatCell(value, locale)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatCell(value, locale) {
  if (typeof value === "number") {
    return value.toLocaleString(locale, { maximumFractionDigits: 2 });
  }
  return value;
}
