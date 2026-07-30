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
          ? "border-[#0f6e56] bg-[#e1f5ee]"
          : "border-[#cfcbb8] bg-[#fffefb] hover:border-[#cfcbb8]"
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
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-[#9fe1cb] bg-[#e1f5ee] text-[#0f6e56]">
          <i className="ti ti-upload text-xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-medium text-[#04342c]">
          Drop file or click to upload
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["CSV", "XLSX", "XLS", "PDF"].map((type) => (
            <span
              key={type}
              className="rounded-md border border-[#9fe1cb] bg-[#e1f5ee] px-2.5 py-1 text-xs font-medium text-[#0f6e56]"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept=".csv,.xlsx,.xls,.pdf"
        hidden
        onChange={(event) => handleFile(event.target.files[0])}
      />
    </div>
  );
}
