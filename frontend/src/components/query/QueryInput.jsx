import { useState } from "react";
export default function QueryInput({ onQuery, loading }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <textarea className="w-full rounded border-2 border-[var(--border)] bg-white p-3 font-semibold text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)]" rows={3} placeholder="e.g. Show revenue trend over time" value={q} onChange={e => setQ(e.target.value)} />
      <button className="rounded border-2 border-[var(--border)] bg-[var(--accent)] px-6 py-2 font-bold text-white shadow-[4px_4px_0_rgba(17,24,39,0.9)] disabled:opacity-50" onClick={() => onQuery(q)} disabled={!q.trim() || loading}>{loading ? "Analyzing..." : "Analyze"}</button>
    </div>
  );
}
