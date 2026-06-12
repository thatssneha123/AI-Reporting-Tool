export default function Button({ children, variant = "primary", loading = false, className = "", disabled, ...props }) {
  const styles = variant === "ghost"
    ? "border border-[#2a2a4a] bg-transparent text-white hover:border-indigo-500"
    : "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-500";

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
      {children}
    </button>
  );
}
