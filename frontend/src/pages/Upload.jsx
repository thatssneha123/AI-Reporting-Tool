import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import DropZone from "../components/upload/DropZone";
import FileValidator from "../components/upload/FileValidator";
import { datasetService } from "../services/datasetService";

const states = [
  { label: "Upload", description: "Secure file intake" },
  { label: "Profile", description: "Schema and quality scan" },
  { label: "Analyze", description: "AI insight generation" },
  { label: "Report", description: "Export-ready output" },
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleValid = useCallback(() => setValid(true), []);
  const handleError = useCallback((message) => {
    setValid(false);
    setError(message);
  }, []);

  const handleUpload = async () => {
    if (!file || !valid) return;
    setUploading(true);
    setError("");
    try {
      const dataset = await datasetService.upload(file);
      navigate(`/query?datasetId=${dataset._id}`);
    } catch (event) {
      setError(event.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1350px] gap-8 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="glass-panel rounded-[28px] p-7">
        <p className="ai-chip">Upload Analysis</p>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Bring every bill into one AI workspace</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">Upload bills, invoices, sales reports, electricity datasets or PDFs. BillInsight AI prepares the dataset for trend analysis, anomaly detection, summaries and exportable reporting.</p>
        <div className="mt-8 space-y-4">
          {states.map((state, index) => (
            <div key={state.label} className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{index + 1}</div>
              <div>
                <p className="font-bold text-slate-950 dark:text-white">{state.label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{state.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <DropZone onFile={(selectedFile) => { setFile(selectedFile); setValid(false); setError(""); }} />
        {file && <div className="mt-5"><FileValidator file={file} onValid={handleValid} onError={handleError} /></div>}
        {uploading && <ThinkingState />}
        {error && <div className="mt-5 rounded-[20px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Files are stored securely and processed through your authenticated workspace.</p>
          <button onClick={handleUpload} disabled={!valid || uploading} className="rounded-2xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
            {uploading ? "Uploading..." : "Upload & Continue"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ThinkingState() {
  return (
    <div className="mt-5 rounded-[22px] border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-400/20 dark:bg-indigo-500/10">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulseSoft rounded-full bg-brand-primary" />
        <p className="text-sm font-bold text-indigo-800 dark:text-indigo-200">AI workspace is preparing your dataset</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="h-3 skeleton" />
        <div className="h-3 skeleton" />
        <div className="h-3 skeleton" />
      </div>
    </div>
  );
}
