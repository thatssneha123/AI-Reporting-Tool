import { useState } from "react";
export default function QueryInput({ onQuery, loading }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <textarea className="border rounded p-3 w-full" rows={3} placeholder="e.g. Show revenue trend over time" value={q} onChange={e => setQ(e.target.value)} />
      <button className="bg-indigo-600 text-white px-6 py-2 rounded disabled:opacity-50" onClick={() => onQuery(q)} disabled={!q.trim() || loading}>{loading ? "Analyzing..." : "Analyze"}</button>
    </div>
  );
}
