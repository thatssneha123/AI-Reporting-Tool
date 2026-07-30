export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-10 text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <section className="w-full rounded-xl border-2 border-[var(--border)] bg-white p-6 shadow-premium sm:p-8">
          <h1 className="text-3xl font-black">{title}</h1>
          {subtitle && <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text-secondary)]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
