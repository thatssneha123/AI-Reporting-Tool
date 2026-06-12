export default function DataPreview({ headers = [], rows = [] }) {
  return (
    <div className="overflow-x-auto"><table className="text-sm w-full border-collapse"><thead><tr>{headers.map(h => <th key={h} className="border px-2 py-1 bg-gray-100">{h}</th>)}</tr></thead><tbody>{rows.slice(0,5).map((r,i) => <tr key={i}>{headers.map(h => <td key={h} className="border px-2 py-1">{r[h]}</td>)}</tr>)}</tbody></table></div>
  );
}
