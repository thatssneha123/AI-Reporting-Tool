import { useCallback, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import DatasetPanel from "../components/dashboard/DatasetPanel";
import QuestionPanel from "../components/dashboard/QuestionPanel";
import ChartSection from "../components/dashboard/ChartSection";
import DashboardGrid from "../components/dashboard/DashboardGrid";
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

  // Dashboard mode: generates complete auto-dashboard (no query needed)
  const generateDashboard = async () => {
    if (!selectedDatasetId) {
      setError("Please upload or select a dataset first.");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const response = await queryService.analyze({ datasetId: selectedDatasetId, query: "" });
      console.log("Dashboard Response:", response);
      setResult(response);
      setManualChartType(response.chartType || "bar");
    } catch (event) {
      setError(event.message || "Dashboard generation failed. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Analyze mode: answers a specific user question
  const analyze = async (prompt = query) => {
    if (!selectedDatasetId) {
      setError("Please upload or select a dataset first.");
      return;
    }
    if (!prompt || !prompt.trim()) {
      setError("Please enter a question to analyze.");
      return;
    }
    setQuery(prompt);
    setAnalyzing(true);
    setError("");
    try {
      const response = await queryService.analyze({ datasetId: selectedDatasetId, query: prompt });
      console.log("API Response:", response);
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
            onDashboard={generateDashboard}
            analyzing={analyzing}
            error={error}
          />

          {/* Dashboard Mode: Full Dashboard Grid */}
          {analyzing ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-sm">
              <div className="relative mb-6 h-12 w-12">
                <div className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-20"></div>
                <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]"></div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">Analyzing Dataset</h3>
              <p className="text-sm text-[var(--text-secondary)]">Crunching numbers and generating AI insights...</p>
            </div>
          ) : !result ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-bright)] bg-[var(--bg-card)] p-8 text-center shadow-sm">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-3xl shadow-inner">
                ✨
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">Ready for Analysis</h3>
              <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                Upload a dataset or select an existing one, then click "Dashboard" for a complete overview or type a question and click "Analyze".
              </p>
            </div>
          ) : result && result.dashboardMode ? (
            <DashboardGrid dashboard={result} locale={numberLocale} onQuestionSelect={analyze} />
          ) : (
            /* Single Chart Mode: Existing behavior */
            <>
              <ChartSection
                chartType={manualChartType || result?.chartType || "bar"}
                setChartType={setManualChartType}
                chartRows={chartRows}
                result={result}
                confidence={confidence}
                locale={numberLocale}
              />

              {result && (
                <>
                  <SummaryCards
                    insights={
                      result.insightBullets ||
                      result.insights ||
                      result.datasetSummary
                    }
                  />

                  {result.consumptionReport && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                      <h2 className="mb-4 text-lg font-semibold">
                        Grocery Consumption Report
                      </h2>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <strong>Total Spend:</strong> ₹
                          {result.consumptionReport.totalSpend}
                        </div>

                        <div>
                          <strong>Healthy Spend:</strong> ₹
                          {result.consumptionReport.healthySpend}
                        </div>

                        <div>
                          <strong>Unhealthy Spend:</strong> ₹
                          {result.consumptionReport.unhealthySpend}
                        </div>

                        <div>
                          <strong>Health Score:</strong>{" "}
                          {result.consumptionReport.healthScore}
                        </div>

                        <div>
                          <strong>Estimated Savings:</strong> ₹
                          {result.consumptionReport.estimatedSavings}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.recommendationReport && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                      <h2 className="mb-4 text-lg font-semibold">
                        Recommendation Report
                      </h2>

                      <div className="mb-4">
                        <h3 className="font-medium">Recommendations</h3>

                        <ul className="list-disc pl-5">
                          {result.recommendationReport.recommendations?.map(
                            (item, index) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </div>
                      {result.recommendationReport?.unhealthyItems?.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium">Unhealthy Items</h3>

                          <ul className="list-disc pl-5">
                            {result.recommendationReport.unhealthyItems.map(
                              (item, index) => (
                                <li key={index}>
                                  {item.item} ({item.category})
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {result.recommendationReport?.healthyItems?.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium">Healthy Items</h3>

                          <ul className="list-disc pl-5">
                            {result.recommendationReport.healthyItems.map(
                              (item, index) => (
                                <li key={index}>
                                  {item.item} ({item.category})
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium">
                          Swadeshi Alternatives
                        </h3>

                        <ul className="list-disc pl-5">
                          {result.recommendationReport.swadeshiAlternatives?.map(
                            (item, index) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  {result.questions && result.questions.questions?.length > 0 && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                      <h3 className="mb-4 font-semibold text-[var(--text-primary)]">
                        {result.questions.title || "Suggested Next Questions"}
                      </h3>
                      <ul className="space-y-2">
                        {result.questions.questions.slice(0, 5).map((q, idx) => (
                          <li
                            key={idx}
                            onClick={() => analyze(q)}
                            className="cursor-pointer text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            • {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {chartRows.length > 0 && (
                    <DataTable
                      data={chartRows}
                      title="Chart Data"
                      locale={numberLocale}
                    />
                  )}
                </>
              )}
            </>
          )}
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
