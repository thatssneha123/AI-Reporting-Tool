export default function AnalyzeButton({ onClick, loading }) {
  return <button className="rounded border-2 border-[var(--border)] bg-[var(--accent)] px-6 py-2 font-bold text-white shadow-[4px_4px_0_rgba(17,24,39,0.9)] disabled:opacity-50" onClick={onClick} disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>;
}
