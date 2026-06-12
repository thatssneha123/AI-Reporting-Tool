export default function UsageStats({ stats }) {
  return (
    <div className="flex gap-6">
      <div><p className="text-2xl font-bold">{stats?.datasetsUploaded ?? 0}</p><p className="text-sm text-gray-500">Datasets</p></div>
      <div><p className="text-2xl font-bold">{stats?.analysesRun ?? 0}</p><p className="text-sm text-gray-500">Analyses</p></div>
    </div>
  );
}
