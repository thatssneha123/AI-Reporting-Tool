export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--text-primary)]">{label}</span>
      <input
        className={`w-full rounded-lg border-2 bg-white px-4 py-3 font-semibold text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:shadow-[4px_4px_0_rgba(17,24,39,0.9)] ${error ? "border-[var(--danger)]" : "border-[var(--border)]"} ${className}`}
        {...props}
      />
      {error && <span className="mt-2 block text-sm font-bold text-[var(--danger)]">{error}</span>}
    </label>
  );
}
