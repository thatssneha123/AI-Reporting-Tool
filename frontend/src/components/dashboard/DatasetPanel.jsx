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
    <section className="rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#8b8a80]">
        DATASET
      </p>

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
          className="mt-3 h-11 w-full rounded-lg bg-[#0f6e56] text-sm font-medium text-[#e1f5ee] hover:bg-[#085041] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {uploading ? "Uploading..." : "Upload Dataset"}
        </button>
      </div>

      <div className="mt-5">
        <label className="text-xs font-medium uppercase tracking-wide text-[#8b8a80]">
          SELECT DATASET
        </label>
        <select
          value={selectedDatasetId}
          onChange={(event) => setSelectedDatasetId(event.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-[#e5e1d8] bg-[#fffefb] px-4 text-xs text-[#3a3a35] outline-none focus:border-[#9fe1cb]"
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
      <div className="mt-5 min-h-12 rounded-lg border border-[#e5e1d8] bg-[#fffefb] p-3 text-xs text-[#8b8a80]">
        Preview appears after file selection.
      </div>
    );
  }

  const headers = Object.keys(rows[0] || {});
  return (
    <div className="mt-5 rounded-lg border border-[#e5e1d8] bg-[#fffefb] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#04342c]">Preview</h3>
        <span className="text-xs text-[#8b8a80]">first 5 rows</span>
      </div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full min-w-[420px] text-xs">
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-[#e5e1d8] px-2 py-2 text-left font-medium uppercase tracking-wide text-[#8b8a80]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header) => (
                  <td
                    key={`${header}-${rowIndex}`}
                    className="max-w-[140px] truncate border-b border-[#e5e1d8] px-2 py-2 text-[#3a3a35]"
                  >
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
