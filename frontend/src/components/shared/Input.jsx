export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">{label}</span>
      <input
        className={`w-full rounded-lg border bg-[#0f0f1a] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 ${error ? "border-red-500" : "border-[#2a2a4a]"} ${className}`}
        {...props}
      />
      {error && <span className="mt-2 block text-sm text-red-400">{error}</span>}
    </label>
  );
}
