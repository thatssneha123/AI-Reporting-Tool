import DropZone from "../upload/DropZone";
import FileValidator from "../upload/FileValidator";

export default function DatasetPanel({
  file,
  valid,
  uploading,
  history,
  selectedDatasetId,
  previewRows,
  handleFile,
  upload,
  setSelectedDatasetId,
  setValid,
  setError,
}) {
  return (
    <section className="card p-5">
      <p className="section-label">Dataset</p>

      <div className="mt-4">
        <DropZone onFile={handleFile} compact />
        {file && (
          <div className="mt-3">
            <FileValidator
              file={file}
              onValid={() => setValid(true)}
              onError={(message) => {
                setValid(false);
                setError(message);
              }}
            />
          </div>
        )}
        <button
          onClick={upload}
          disabled={!valid || uploading}
          className="mt-3 h-11 w-full rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-sm font-semibold text-white hover:-translate-y-px hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {uploading ? "Uploading..." : "Upload Dataset"}
        </button>
      </div>

      <div className="mt-5">
        <label className="section-label">Select dataset</label>
        <select
          value={selectedDatasetId}
          onChange={(event) => setSelectedDatasetId(event.target.value)}
          className="input-dark mono mt-2 h-11 w-full px-4 text-xs"
        >
          <option value="">Select dataset</option>
          {history.map((item) => (
            <option key={item._id} value={item._id}>
              {item.originalName}
            </option>
          ))}
        </select>
      </div>

      <DatasetPreview rows={previewRows} />
    </section>
  );
}

function DatasetPreview({ rows }) {
  if (!rows.length) {
    return (
      <div className="mono mt-5 min-h-12 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-muted)]">
        Preview appears after file selection.
      </div>
    );
  }

  const headers = Object.keys(rows[0] || {});
  return (
    <div className="mt-5 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Preview</h3>
        <span className="mono text-xs text-[var(--text-muted)]">first 5 rows</span>
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="mono border-b border-[var(--border)] px-2 py-2 text-left font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header) => (
                  <td key={`${header}-${rowIndex}`} className="mono max-w-[140px] truncate border-b border-[var(--border)] px-2 py-2 text-[var(--text-secondary)]">
                    {String(row[header] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
