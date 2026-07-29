import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { label: "Workspace", path: "/dashboard", icon: "W" },
  { label: "Subscription", path: "/subscription", icon: "S" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <nav className="fixed inset-x-0 top-0 z-40 border-b-2 border-[var(--border)] bg-white px-5 py-3 shadow-[0_4px_0_rgba(17,24,39,0.9)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/login" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[var(--border)] bg-brand-primary text-sm font-black text-white shadow-glow">BI</span>
            <span className="font-bold tracking-tight text-[var(--text-primary)]">BillInsight AI</span>
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/login" className="font-bold text-[var(--text-secondary)] hover:text-brand-primary">Login</Link>
            <Link to="/signup" className="rounded-lg border-2 border-[var(--border)] bg-brand-primary px-4 py-2 font-bold text-white shadow-glow">Sign up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r-2 border-[var(--border)] bg-white p-5 shadow-[4px_0_0_rgba(17,24,39,0.9)] lg:block">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[var(--border)] bg-brand-primary text-sm font-black text-white shadow-glow">BI</span>
          <span>
            <span className="block text-lg font-black tracking-tight text-[var(--text-primary)]">BillInsight AI</span>
            <span className="text-xs font-bold text-[var(--text-muted)]">Enterprise bill intelligence</span>
          </span>
        </Link>

        <div className="mt-9 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={`${item.label}-${item.path}`}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-2 border-[var(--border)] bg-brand-primary text-white shadow-glow"
                    : "border-2 border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[#dbeafe] hover:text-[var(--text-primary)]"
                }`
              }
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[var(--border)] bg-[#fef3c7] text-xs font-black text-[var(--text-primary)] transition group-hover:bg-[#ffedd5]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="absolute inset-x-5 bottom-5 rounded-xl border-2 border-[var(--border)] bg-[#dcfce7] p-4 shadow-[4px_4px_0_rgba(17,24,39,0.9)]">
          <p className="text-sm font-black text-[var(--text-primary)]">AI Confidence Active</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[var(--text-secondary)]">Bill, invoice, sales and dataset analysis with explainable outputs.</p>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 border-b-2 border-[var(--border)] bg-white px-4 py-3 shadow-[0_4px_0_rgba(17,24,39,0.9)] lg:left-72">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[var(--border)] bg-brand-primary text-xs font-black text-white shadow-glow">BI</span>
          </Link>
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              className="h-11 w-full rounded-xl border-2 border-[var(--border)] bg-white pl-10 pr-4 text-sm font-semibold text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-brand-primary"
              placeholder="Search workspace..."
            />
          </div>
          <button className="hidden h-11 w-11 place-items-center rounded-xl border-2 border-[var(--border)] bg-white text-[var(--text-secondary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)] transition hover:bg-[#dbeafe] hover:text-brand-primary sm:grid" aria-label="Notifications">
            ◦
          </button>
          <button
            onClick={() => setDark((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[var(--border)] bg-[#fef3c7] text-xs font-black text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)] transition hover:bg-[#ffedd5]"
            aria-label="Toggle theme"
          >
            {dark ? "LT" : "DK"}
          </button>
          <button onClick={handleLogout} className="flex h-11 items-center gap-3 rounded-xl border-2 border-[var(--border)] bg-white px-3 text-left shadow-[2px_2px_0_rgba(17,24,39,0.9)] transition hover:bg-[#fee2e2]">
            <span className="grid h-8 w-8 place-items-center rounded-xl border-2 border-[var(--border)] bg-brand-secondary text-xs font-bold text-white">{user.name?.[0] || "U"}</span>
            <span className="hidden sm:block">
              <span className="block text-xs font-bold text-[var(--text-primary)]">{user.name || "User"}</span>
              <span className="block text-[11px] font-semibold text-[var(--text-muted)]">Logout</span>
            </span>
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 rounded-xl border-2 border-[var(--border)] bg-white p-2 shadow-premium lg:hidden">
        {navItems.map((item) => (
          <NavLink key={`${item.label}-mobile`} to={item.path} className={({ isActive }) => `grid place-items-center rounded-lg py-2 text-[11px] font-black ${isActive ? "border-2 border-[var(--border)] bg-brand-primary text-white" : "text-[var(--text-muted)]"}`}>
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
