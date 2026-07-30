export default function Button({ children, variant = "primary", loading = false, className = "", disabled, ...props }) {
  const styles = variant === "ghost"
    ? "border-2 border-[var(--border)] bg-white text-[var(--text-primary)] shadow-[4px_4px_0_rgba(17,24,39,0.9)] hover:bg-[#dbeafe]"
    : "border-2 border-[var(--border)] bg-[var(--accent)] text-white shadow-[4px_4px_0_rgba(17,24,39,0.9)] hover:bg-[#fb923c]";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-3 font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-[var(--border)]" />}
      {children}
    </button>
  );
}
