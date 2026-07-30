export default function PlanCard({ plan, onSelect, active }) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border-2 border-[var(--border)] bg-white p-6 shadow-premium ${active ? "bg-[#ffedd5]" : ""}`}>
      <h3 className="text-xl font-black text-[var(--text-primary)]">{plan.name}</h3>
      <p className="mono text-3xl font-black text-[var(--text-primary)]">
        &#8377;{plan.price}
        <span className="text-sm font-bold text-[var(--text-muted)]"> / {plan.duration}</span>
      </p>
      <ul className="flex flex-col gap-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="text-sm font-semibold text-[var(--text-secondary)]">
            &#10003; {feature}
          </li>
        ))}
      </ul>
      <button className="mt-auto rounded-lg border-2 border-[var(--border)] bg-[var(--accent)] py-2 font-bold text-white shadow-[4px_4px_0_rgba(17,24,39,0.9)]" onClick={() => onSelect(plan)}>
        Choose Plan
      </button>
    </div>
  );
}
