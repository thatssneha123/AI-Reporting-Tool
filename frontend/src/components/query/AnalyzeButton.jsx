export default function AnalyzeButton({ onClick, loading }) {
  return <button className="bg-indigo-600 text-white px-6 py-2 rounded disabled:opacity-50" onClick={onClick} disabled={loading}>{loading ? "Analyzing..." : "Analyze"}</button>;
}
