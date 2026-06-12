export default function AnalysisCard({ analysis }) {
  return (
    <div className="border rounded p-4">
      <p className="font-medium">{analysis.query}</p>
      <p className="text-sm text-gray-500">{new Date(analysis.createdAt).toLocaleDateString()}</p>
    </div>
  );
}
