export default function QuestionPanel({
  query,
  setQuery,
  analyze,
  onDashboard,
  analyzing,
  error,
}) {
  return (
    <section className="rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#8b8a80]">
        QUESTION
      </p>

      <div className="relative mt-4">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          rows={4}
          className="h-[100px] w-full resize-none rounded-xl border border-[#e5e1d8] bg-[#fffefb] p-4 text-sm text-[#3a3a35] outline-none placeholder:text-[#8b8a80] focus:border-[#9fe1cb]"
          placeholder="Example: Show top 5 cities by electricity bill"
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onDashboard()}
          disabled={analyzing}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0f6e56] text-[15px] font-medium text-[#e1f5ee] hover:bg-[#085041] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {analyzing && (
            <span className="h-4 w-4 animate-spin rounded-full border border-[#e1f5ee] border-t-[#0f6e56]" />
          )}
          <span>{analyzing ? "Generating..." : "Dashboard"}</span>
        </button>

        <button
          onClick={() => analyze()}
          disabled={analyzing}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-[#9fe1cb] bg-[#fffefb] text-[15px] font-medium text-[#0f6e56] hover:bg-[#e1f5ee] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {analyzing && (
            <span className="h-4 w-4 animate-spin rounded-full border border-[#9fe1cb] border-t-[#0f6e56]" />
          )}
          <span>{analyzing ? "Analyzing..." : "Analyze"}</span>
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#f0997b] bg-[#faece7] px-4 py-3 text-sm font-medium text-[#712b13]">
          <i className="ti ti-alert-circle mt-0.5 text-base" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
