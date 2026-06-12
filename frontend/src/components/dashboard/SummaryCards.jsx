const insightTypes = [
  {
    title: "Finding",
    icon: "F",
    line: "linear-gradient(90deg,#7c6fdf,#a78bfa)",
    badge: "linear-gradient(135deg,#7c6fdf,#a78bfa)",
  },
  {
    title: "Opportunity",
    icon: "O",
    line: "linear-gradient(90deg,#059669,#34d399)",
    badge: "linear-gradient(135deg,#059669,#34d399)",
  },
  {
    title: "Risk",
    icon: "R",
    line: "linear-gradient(90deg,#dc2626,#f87171)",
    badge: "linear-gradient(135deg,#dc2626,#f87171)",
  },
  {
    title: "Anomaly",
    icon: "A",
    line: "linear-gradient(90deg,#d97706,#fbbf24)",
    badge: "linear-gradient(135deg,#d97706,#fbbf24)",
  },
  {
    title: "Recommendations",
    icon: "N",
    line: "linear-gradient(90deg,#7c3aed,#c084fc)",
    badge: "linear-gradient(135deg,#7c3aed,#c084fc)",
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
            className="card relative min-h-[190px] overflow-hidden p-5 hover:-translate-y-0.5 hover:border-[var(--accent)]"
          >
            <div className="absolute left-0 top-0 h-[3px] w-full" style={{ background: type.line }} />
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
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
