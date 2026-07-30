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
  const visibleUnhealthyItems = useMemo(
    () => filterRecommendationItems(result?.recommendationReport?.unhealthyItems),
    [result?.recommendationReport?.unhealthyItems]
  );
  const visibleHealthyItems = useMemo(
    () => filterRecommendationItems(result?.recommendationReport?.healthyItems),
    [result?.recommendationReport?.healthyItems]
  );
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#04342c]">
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#e5e1d8] bg-[#fffefb] px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0f6e56] text-[#e1f5ee]">
              <i className="ti ti-sparkles text-lg" aria-hidden="true" />
            </span>
            <h1 className="text-sm font-medium text-[#04342c]">AI Reporting Tool</h1>
            <span className="hidden max-w-[260px] truncate rounded-full border border-[#e5e1d8] bg-[#f1efe8] px-3 py-1 text-xs font-medium text-[#5f6e69] sm:inline-block">
              {selectedDataset?.originalName || (loadingHistory ? "Loading..." : "No dataset")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e1d8] bg-[#f1efe8] px-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0f6e56] text-[10px] font-medium text-[#e1f5ee]">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-[110px] truncate text-xs font-medium text-[#04342c]">
                {user?.name || "User"}
              </span>
              <span className="block max-w-[140px] truncate text-[10px] text-[#8b8a80]">
                {user?.email || "Signed in"}
              </span>
            </span>
          </div>
          <button
            onClick={logout}
            className="h-9 rounded-lg border border-[#e5e1d8] bg-[#fffefb] px-4 text-xs font-medium text-[#04342c] hover:border-[#cfcbb8] hover:bg-[#f1efe8]"
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
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-8">
              <div className="relative mb-6 h-12 w-12">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#e1f5ee]"></div>
                <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-[#e5e1d8] border-t-[#0f6e56]"></div>
              </div>
              <h3 className="mb-2 text-lg font-medium text-[#04342c]">Analyzing Dataset</h3>
              <p className="text-sm text-[#3a3a35]">Crunching numbers and generating AI insights...</p>
            </div>
          ) : !result ? (
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e1d8] bg-[#fffefb] p-8 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-[#9fe1cb] bg-[#e1f5ee] text-[#0f6e56]">
                <i className="ti ti-sparkles text-3xl" aria-hidden="true" />
              </div>
              <h3 className="mb-3 text-xl font-medium text-[#04342c]">Ready for analysis</h3>
              <p className="max-w-md text-sm leading-relaxed text-[#8b8a80]">
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
                    <div className="rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5 text-[#3a3a35]">
                      <h2 className="mb-4 text-lg font-medium text-[#04342c]">
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
                    <div className="rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5 text-[#3a3a35]">
                      <h2 className="mb-4 text-lg font-medium text-[#04342c]">
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
                      {visibleUnhealthyItems.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium">Unhealthy Items</h3>

                          <ul className="list-disc pl-5">
                            {visibleUnhealthyItems.map(
                              (item, index) => (
                                <li key={index}>
                                  {item.item} ({item.category})
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {visibleHealthyItems.length > 0 && (
                        <div className="mt-4">
                          <h3 className="font-medium">Healthy Items</h3>

                          <ul className="list-disc pl-5">
                            {visibleHealthyItems.map(
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

function filterRecommendationItems(items) {
  if (!Array.isArray(items)) return [];

  const seen = new Set();

  return items.filter((item) => {
    const normalizedName = String(item?.item || "").trim().toLowerCase();

    if (!normalizedName || normalizedName === "(unknown)" || seen.has(normalizedName)) {
      return false;
    }

    seen.add(normalizedName);
    return true;
  });
}
