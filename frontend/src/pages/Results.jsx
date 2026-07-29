import { useLocation, useNavigate } from "react-router-dom";
import InsightPanel from "../components/results/InsightPanel";
import ChartRenderer from "../components/results/ChartRenderer";
import DataTable from "../components/results/DataTable";

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="glass-panel rounded-[28px] p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl border-2 border-[var(--border)] bg-brand-primary text-sm font-black text-white shadow-glow">AI</div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-[var(--text-primary)]">No analysis report yet</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-[var(--text-muted)]">Upload a dataset or ask BillInsight AI a question to generate charts, findings, recommendations and exportable tables.</p>
          <div className="mt-7 flex justify-center gap-3">
            <button onClick={() => navigate("/upload")} className="rounded-xl border-2 border-[var(--border)] bg-brand-primary px-5 py-3 text-sm font-bold text-white shadow-glow">Upload Dataset</button>
            <button onClick={() => navigate("/dashboard")} className="rounded-xl border-2 border-[var(--border)] bg-white px-5 py-3 text-sm font-bold text-[var(--text-primary)] shadow-[4px_4px_0_rgba(17,24,39,0.9)]">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1450px] flex-col gap-8">
      <section className="glass-panel rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ai-chip">Analysis Results</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--text-primary)]">AI-generated report is ready</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-[var(--text-secondary)]">Review insights, inspect chart data, export results and continue analysis from this structured report.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Rows" value={result.chartData?.length || 0} />
            <Metric label="Chart" value={result.chartType || "bar"} />
            <Metric label="Confidence" value={`${Math.round((result.intent?.confidence || 0.94) * 100)}%`} />
          </div>
        </div>
      </section>

      <InsightPanel insights={result.insights} />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartRenderer
          chartType={result.chartType}
          data={result.chartData}
          title="Primary Analysis Chart"
          xAxis={result.intent?.xAxis}
          yAxis={result.intent?.yAxis}
        />
        <section className="glass-panel rounded-[24px] p-5">
          <p className="ai-chip">AI intent</p>
          <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">How BillInsight AI understood it</h3>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["Analysis Type", result.intent?.analysisType || "Automated"],
              ["X Axis", result.intent?.xAxis || "Detected"],
              ["Y Axis", result.intent?.yAxis || "Detected"],
              ["Aggregation", result.intent?.aggregation || "Smart default"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border-2 border-[var(--border)] bg-[#fff7ed] px-4 py-3 shadow-[2px_2px_0_rgba(17,24,39,0.9)]">
                <span className="font-semibold text-[var(--text-muted)]">{label}</span>
                <span className="font-bold text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <DataTable data={result.chartData} title="Analysis Results Table" />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border-2 border-[var(--border)] bg-white px-4 py-3 shadow-[2px_2px_0_rgba(17,24,39,0.9)]">
      <p className="text-xs font-bold text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-black text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
