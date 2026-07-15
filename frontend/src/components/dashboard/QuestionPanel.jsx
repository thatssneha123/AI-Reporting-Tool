export default function QuestionPanel({
  query,
  setQuery,
  analyze,
  onDashboard,
  analyzing,
  error,
}) {
  return (
    <section className="card p-5">
      <p className="section-label">Question</p>

      <div className="relative mt-4">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          rows={4}
          className="input-dark h-[100px] w-full resize-none rounded-xl border-[1.5px] p-4 text-sm placeholder:text-[var(--text-muted)]"
          placeholder="Example: Show top 5 cities by electricity bill"
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onDashboard()}
          disabled={analyzing}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[15px] font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
        >
          {analyzing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          <span>{analyzing ? "Generating..." : "Dashboard"}</span>
        </button>

        <button
          onClick={() => analyze()}
          disabled={analyzing}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--border-bright)] bg-[var(--bg-elevated)] text-[15px] font-semibold text-[var(--text-primary)] shadow-sm transition-all hover:-translate-y-px hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45"
        >
          {analyzing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          <span>{analyzing ? "Analyzing..." : "Analyze"}</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {error}
        </div>
      )}
    </section>
  );
}
