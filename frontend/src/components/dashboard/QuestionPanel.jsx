export default function QuestionPanel({
  query,
  setQuery,
  analyze,
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

      <button
        onClick={() => analyze()}
        disabled={analyzing}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-[15px] font-semibold text-white hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45"
      >
        {analyzing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
        <span>{analyzing ? "Analyzing..." : "Analyze"}</span>
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {error}
        </div>
      )}
    </section>
  );
}
