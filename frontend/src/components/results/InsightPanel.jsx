const insightTypes = [
  { title: "Finding", icon: "F", tone: "bg-indigo-600", ring: "border-indigo-200 dark:border-indigo-400/20" },
  { title: "Opportunity", icon: "O", tone: "bg-emerald-600", ring: "border-emerald-200 dark:border-emerald-400/20" },
  { title: "Risk", icon: "R", tone: "bg-amber-600", ring: "border-amber-200 dark:border-amber-400/20" },
  { title: "Anomaly", icon: "A", tone: "bg-rose-600", ring: "border-rose-200 dark:border-rose-400/20" },
  { title: "Recommendations", icon: "N", tone: "bg-slate-900 dark:bg-white dark:text-slate-950", ring: "border-slate-200 dark:border-white/10" },
];

export default function InsightPanel({ insights }) {
  const bullets = normalizeInsights(insights);

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ai-chip">Insights</p>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Summary</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {insightTypes.map((type, index) => (
          <article key={type.title} className={`min-h-[190px] rounded-[22px] border bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 dark:bg-slate-950/70 ${type.ring}`}>
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${type.tone} text-sm font-black text-white shadow-lg`}>
              {type.icon}
            </div>
            <h3 className="mt-5 text-sm font-bold text-slate-950 dark:text-white">{type.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{bullets[index] || bullets[0] || "Run an analysis to reveal this signal."}</p>
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
