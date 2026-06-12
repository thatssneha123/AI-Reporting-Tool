import { useCallback, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import DatasetPanel from "../components/dashboard/DatasetPanel";
import QuestionPanel from "../components/dashboard/QuestionPanel";
import ChartSection from "../components/dashboard/ChartSection";
import SummaryCards from "../components/dashboard/SummaryCards";
import DataTable from "../components/results/DataTable";
import { datasetService } from "../services/datasetService";
import { queryService } from "../services/queryService";
import { useAuth } from "../hooks/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [file, setFile] = useState(null);
  const [valid, setValid] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [manualChartType, setManualChartType] = useState("bar");
  const [numberLocale, setNumberLocale] = useState(() => localStorage.getItem("numberLocale") || "en-US");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const rows = await datasetService.getHistory();
      setHistory(rows);
      setSelectedDatasetId((current) => current || rows[0]?._id || "");
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    localStorage.setItem("numberLocale", numberLocale);
  }, [numberLocale]);

  const selectedDataset = useMemo(
    () => history.find((item) => item._id === selectedDatasetId),
    [history, selectedDatasetId]
  );

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    setValid(false);
    setError("");
    parseDatasetPreview(selectedFile)
      .then(setPreviewRows)
      .catch(() => setPreviewRows([]));
  };

  const upload = async () => {
    if (!file || !valid) return;
    setUploading(true);
    setError("");
    try {
      const dataset = await datasetService.upload(file);
      setSelectedDatasetId(dataset._id);
      setFile(null);
      setValid(false);
      await loadHistory();
    } catch (event) {
      setError(event.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const analyze = async (prompt = query) => {
    if (!selectedDatasetId) {
      setError("Please upload or select a dataset first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a question for the chart.");
      return;
    }

    setAnalyzing(true);
    setError("");
    try {
      const response = await queryService.analyze({ datasetId: selectedDatasetId, query: prompt });
      setQuery(prompt);
      setResult(response);
      setManualChartType(response.chartType || "bar");
    } catch (event) {
      setError(event.message || "Analysis failed. Try a clearer question.");
    } finally {
      setAnalyzing(false);
    }
  };

  const chartRows = Array.isArray(result?.chartData) ? result.chartData : [];
  const confidence = Math.round((result?.intent?.confidence || 0) * 100);
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[var(--border)] bg-[rgba(10,10,15,0.85)] px-6 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-xs font-bold text-white">AI</span>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">AI Reporting Tool</h1>
            <span className="mono hidden max-w-[260px] truncate rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] sm:inline-block">
              {selectedDataset?.originalName || (loadingHistory ? "Loading..." : "No dataset")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[10px] font-bold text-white">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-[110px] truncate text-xs font-semibold text-[var(--text-primary)]">
                {user?.name || "User"}
              </span>
              <span className="mono block max-w-[140px] truncate text-[10px] text-[var(--text-muted)]">
                {user?.email || "Signed in"}
              </span>
            </span>
          </div>
          <button
            onClick={logout}
            className="h-9 rounded-[10px] border border-[var(--border-bright)] px-4 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="grid gap-5 p-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <DatasetPanel
          file={file}
          valid={valid}
          uploading={uploading}
          history={history}
          selectedDatasetId={selectedDatasetId}
          previewRows={previewRows}
          handleFile={handleFile}
          upload={upload}
          setSelectedDatasetId={setSelectedDatasetId}
          setValid={setValid}
          setError={setError}
        />

        <div className="flex min-w-0 flex-col gap-5">
          <QuestionPanel
            query={query}
            setQuery={setQuery}
            analyze={analyze}
            analyzing={analyzing}
            error={error}
          />

          <ChartSection
            chartType={manualChartType || result?.chartType || "bar"}
            setChartType={setManualChartType}
            chartRows={chartRows}
            result={result}
            confidence={confidence}
            locale={numberLocale}
          />

          {result && <SummaryCards insights={result.insightBullets || result.insights} />}
          <DataTable data={chartRows} title="Chart Data" locale={numberLocale} />
        </div>
      </main>
    </div>
  );
}

function parseDatasetPreview(file) {
  if (!file) return Promise.resolve([]);
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 5,
        complete: (result) => resolve(result.data || []),
        error: reject,
      });
    });
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return file.arrayBuffer().then((buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet, { defval: "" }).slice(0, 5);
    });
  }

  return Promise.resolve([]);
}
