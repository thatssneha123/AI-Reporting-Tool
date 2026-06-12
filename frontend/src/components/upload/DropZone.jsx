import { useRef, useState } from "react";

export default function DropZone({ onFile, compact = false }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file) onFile(file);
  };

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-dashed ${
        dragging
          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-[0_0_0_4px_var(--accent-glow)]"
          : "border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] hover:border-[var(--accent)]"
      } ${compact ? "p-6" : "p-8 sm:p-10"}`}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files[0]);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onClick={() => ref.current.click()}
    >
      <div className="relative flex flex-col items-center text-center">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-xs font-black text-white">AI</div>
        <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">Drop file or click to upload</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["CSV", "XLSX", "XLS", "PDF"].map((type) => (
            <span key={type} className="mono rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">{type}</span>
          ))}
        </div>
      </div>
      <input ref={ref} type="file" accept=".csv,.xlsx,.xls,.pdf" hidden onChange={(event) => handleFile(event.target.files[0])} />
    </div>
  );
}
