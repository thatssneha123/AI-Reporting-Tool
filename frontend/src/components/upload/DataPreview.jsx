export default function DataPreview({ headers = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-[var(--border)] bg-white shadow-[2px_2px_0_rgba(17,24,39,0.9)]"><table className="w-full border-collapse text-sm"><thead><tr>{headers.map(h => <th key={h} className="border-2 border-[var(--border)] bg-[#fef3c7] px-2 py-1 text-left font-black text-[var(--text-primary)]">{h}</th>)}</tr></thead><tbody>{rows.slice(0,5).map((r,i) => <tr key={i}>{headers.map(h => <td key={h} className="border-2 border-[var(--border)] px-2 py-1 font-semibold text-[var(--text-secondary)]">{r[h]}</td>)}</tr>)}</tbody></table></div>
  );
}
