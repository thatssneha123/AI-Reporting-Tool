const insightTypes = [
  { title: "Finding", icon: "F", tone: "bg-[#3b82f6]" },
  { title: "Opportunity", icon: "O", tone: "bg-[#22c55e]" },
  { title: "Risk", icon: "R", tone: "bg-[#eab308]" },
  { title: "Anomaly", icon: "A", tone: "bg-[#ef4444]" },
  { title: "Recommendations", icon: "N", tone: "bg-[#a855f7]" },
];

export default function InsightPanel({ insights }) {
  const bullets = normalizeInsights(insights);

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ai-chip">Insights</p>
          <h2 className="mt-3 text-xl font-black tracking-tight text-[var(--text-primary)]">Summary</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {insightTypes.map((type, index) => (
          <article key={type.title} className="min-h-[190px] rounded-xl border-2 border-[var(--border)] bg-white p-5 shadow-premium transition hover:bg-[#fff7ed]">
            <div className={`grid h-11 w-11 place-items-center rounded-xl border-2 border-[var(--border)] ${type.tone} text-sm font-black text-white shadow-[2px_2px_0_rgba(17,24,39,0.9)]`}>
              {type.icon}
            </div>
            <h3 className="mt-5 text-sm font-bold text-[var(--text-primary)]">{type.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text-secondary)]">{bullets[index] || bullets[0] || "Run an analysis to reveal this signal."}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function normalizeInsights(insights) {
  if (Array.isArray(insights)) return insights;
  if (!insights) return [];
  return String(insights)
    .split(/\n|•|-/)
    .map((item) => item.trim())
    .filter(Boolean);
}
