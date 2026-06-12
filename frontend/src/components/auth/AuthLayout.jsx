export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[#0a0a14] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <section className="w-full rounded-xl border border-[#2a2a4a] bg-[#1a1a2e] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-gray-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
