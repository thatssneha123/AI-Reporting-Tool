import { useEffect } from "react";

const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function FileValidator({ file, onValid, onError }) {
  const validation = validateFile(file);

  useEffect(() => {
    if (!file) return;
    if (validation.valid) onValid(file);
    else onError(validation.message);
  }, [file, onError, onValid, validation.message, validation.valid]);

  if (!file) return null;

  return (
    <div className={`rounded-xl border p-4 ${validation.valid ? "border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.08)] text-[var(--success)]" : "border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.08)] text-[var(--danger)]"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{file.name}</p>
          <p className="mono mt-1 text-xs opacity-75">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs font-semibold">{validation.valid ? "Ready" : "Blocked"}</span>
      </div>
      {!validation.valid && <p className="mt-3 text-sm">{validation.message}</p>}
    </div>
  );
}

function validateFile(file) {
  if (!file) return { valid: false, message: "" };
  const name = file.name.toLowerCase();
  const validType = ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension));
  if (!validType) return { valid: false, message: "Only CSV, XLS, XLSX and PDF files are supported." };
  if (file.size > MAX_SIZE) return { valid: false, message: "File must be under 10 MB." };
  return { valid: true, message: "Ready for analysis." };
}
