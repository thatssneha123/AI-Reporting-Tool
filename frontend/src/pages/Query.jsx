import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { queryService } from "../services/queryService";

const prompts = [
  "Show monthly electricity bill trend",
  "Show total electricity bill by city",
  "Find correlation between tariff rate and electricity bill",
  "Show top 10 highest bill values",
  "Detect outliers in monthly hours",
  "Summarize data quality and missing values",
];

export default function Query() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const datasetId = params.get("datasetId");

  const analyze = async (value = query) => {
    if (!value.trim()) return;
    if (!datasetId) {
      setError("Upload a dataset first, then ask BillInsight AI to analyze it.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await queryService.analyze({ datasetId, query: value });
      navigate("/results", { state: { result } });
    } catch (event) {
      setError(event.message || "Analysis failed. Please try a clearer question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <section className="glass-panel rounded-[30px] p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ai-chip">AI Analyst</p>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">Ask questions in plain English</h1>
          <p className="mt-4 text-sm font-semibold leading-7 text-[var(--text-secondary)]">BillInsight AI maps your question to columns, aggregations, trends and charts, then creates a structured report.</p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-xl border-2 border-[var(--border)] bg-white p-3 shadow-premium">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={5}
            className="w-full resize-none bg-transparent p-4 text-base font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            placeholder="Example: Show total electricity bill by city"
          />
          <div className="flex flex-col gap-3 border-t-2 border-[var(--border)] px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <span className="h-2 w-2 animate-pulseSoft rounded-full bg-brand-accent" />
              {loading ? "AI is profiling schema and computing charts..." : "Ready for revenue, bills, invoices and datasets"}
            </div>
            <button onClick={() => analyze()} disabled={!query.trim() || loading} className="rounded-xl border-2 border-[var(--border)] bg-brand-primary px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:bg-[#fb923c] disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {error && <div className="mx-auto mt-5 max-w-3xl rounded-xl border-2 border-[var(--border)] bg-[#fee2e2] p-4 text-sm font-bold text-[var(--danger)] shadow-[2px_2px_0_rgba(17,24,39,0.9)]">{error}</div>}

        <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-2">
          {prompts.map((prompt) => (
            <button key={prompt} onClick={() => { setQuery(prompt); analyze(prompt); }} disabled={loading} className="rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 text-left text-sm font-bold text-[var(--text-secondary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)] transition hover:bg-[#dbeafe] hover:text-brand-primary disabled:opacity-50">
              {prompt}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
