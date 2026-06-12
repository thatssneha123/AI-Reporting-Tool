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
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">Ask questions in plain English</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">BillInsight AI maps your question to columns, aggregations, trends and charts, then creates a structured report.</p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-[26px] border border-slate-200 bg-white/75 p-3 shadow-premium dark:border-white/10 dark:bg-white/10">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            rows={5}
            className="w-full resize-none bg-transparent p-4 text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            placeholder="Example: Show total electricity bill by city"
          />
          <div className="flex flex-col gap-3 border-t border-slate-200 px-2 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 animate-pulseSoft rounded-full bg-brand-accent" />
              {loading ? "AI is profiling schema and computing charts..." : "Ready for revenue, bills, invoices and datasets"}
            </div>
            <button onClick={() => analyze()} disabled={!query.trim() || loading} className="rounded-2xl bg-gradient-to-r from-brand-primary to-brand-accent px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {error && <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">{error}</div>}

        <div className="mx-auto mt-7 grid max-w-3xl gap-3 sm:grid-cols-2">
          {prompts.map((prompt) => (
            <button key={prompt} onClick={() => { setQuery(prompt); analyze(prompt); }} disabled={loading} className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-primary disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {prompt}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
