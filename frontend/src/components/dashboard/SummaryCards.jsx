const insightTypes = [
  {
    title: "Finding",
    icon: "F",
    line: "#3b82f6",
    badge: "#3b82f6",
  },
  {
    title: "Opportunity",
    icon: "O",
    line: "#22c55e",
    badge: "#22c55e",
  },
  {
    title: "Risk",
    icon: "R",
    line: "#ef4444",
    badge: "#ef4444",
  },
  {
    title: "Anomaly",
    icon: "A",
    line: "#f97316",
    badge: "#f97316",
  },
  {
    title: "Recommendations",
    icon: "N",
    line: "#a855f7",
    badge: "#a855f7",
  },
];

export default function SummaryCards({ insights }) {
  const bullets = normalizeInsights(insights);

  return (
    <section>
      <div className="mb-5">
        <p className="badge-accent inline-flex">Insights</p>
        <h2 className="mt-3 text-[22px] font-bold text-[var(--text-primary)]">Summary</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {insightTypes.map((type, index) => (
          <article
            key={type.title}
            className="card relative min-h-[190px] overflow-hidden p-5 hover:border-[var(--accent)]"
          >
            <div className="absolute left-0 top-0 h-2 w-full border-b-2 border-[var(--border)]" style={{ background: type.line }} />
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--border)] text-sm font-black text-white shadow-[2px_2px_0_rgba(17,24,39,0.9)]"
              style={{ background: type.badge }}
            >
              {type.icon}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">{type.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              {renderInsightText(bullets[index] || bullets[0] || "Run an analysis to reveal this signal.")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function renderInsightText(text) {
  const parts = String(text).split(/(\d[\d,.]*%?)/g);
  return parts.map((part, index) => (
    /\d/.test(part)
      ? <span key={index} className="mono font-medium text-[var(--text-primary)]">{part}</span>
      : part
  ));
}

function normalizeInsights(insights) {
  if (Array.isArray(insights)) return insights;
  if (!insights) return [];
  return String(insights)
    .split(/\n|â€¢|-/)
    .map((item) => item.trim())
    .filter(Boolean);
}
