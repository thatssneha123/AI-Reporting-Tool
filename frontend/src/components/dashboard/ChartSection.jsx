import ChartRenderer from "../results/ChartRenderer";

export default function ChartSection({
  chartType,
  setChartType,
  chartRows,
  result,
  confidence,
  locale,
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
      <ChartRenderer
        chartType={chartType}
        data={chartRows}
        title="Chart"
        xAxis={result?.intent?.xAxis}
        yAxis={result?.intent?.yAxis}
        locale={locale}
      />

      <aside className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">Chart settings</p>
          <select
            value={chartType}
            onChange={(event) => setChartType(event.target.value)}
            className="neo-input h-10 w-[120px] px-3 text-sm font-medium capitalize"
          >
            {["bar", "line", "pie", "scatter"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <dl className="mt-4 text-sm">
          <SettingRow label="Chart" value={chartType || "Waiting"} />
          <SettingRow label="Analysis" value={result?.intent?.analysisType || "Waiting"} />
          <SettingRow label="X Axis" value={result?.intent?.xAxis || "Auto"} />
          <SettingRow label="Y Axis" value={result?.intent?.yAxis || "Auto"} />
          <SettingRow label="Rows" value={chartRows.length} />
          <div className="border-b-2 border-[var(--border)] py-2.5 last:border-0">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-xs font-bold text-[var(--text-secondary)]">Confidence</dt>
              <dd className={`mono rounded-md border-2 border-[var(--border)] bg-[#fff7ed] px-2 py-1 text-xs font-bold ${confidence >= 100 ? "text-[var(--success)]" : "text-[var(--text-primary)]"}`}>
                {confidence ? `${confidence}%` : "Waiting"}
              </dd>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-sm border-2 border-[var(--border)] bg-[#fee2e2]">
              <div className="h-full rounded-sm bg-[var(--success)]" style={{ width: `${Math.min(confidence || 0, 100)}%` }} />
            </div>
          </div>
        </dl>
      </aside>
    </section>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--border)] py-2.5 last:border-0">
      <dt className="text-xs font-bold text-[var(--text-secondary)]">{label}</dt>
      <dd className="mono max-w-[180px] truncate rounded-md border-2 border-[var(--border)] bg-[#fff7ed] px-2 py-1 text-xs font-bold text-[var(--text-primary)]">
        {value}
      </dd>
    </div>
  );
}
