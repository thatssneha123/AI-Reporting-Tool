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
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/70 bg-white/80 px-5 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/login" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent text-sm font-black text-white shadow-glow">BI</span>
            <span className="font-semibold tracking-tight text-slate-950 dark:text-white">BillInsight AI</span>
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/login" className="text-slate-600 hover:text-brand-primary dark:text-slate-300">Login</Link>
            <Link to="/signup" className="rounded-full bg-slate-950 px-4 py-2 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950">Sign up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/70 bg-white/75 p-5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 lg:block">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[18px] bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent text-sm font-black text-white shadow-glow">BI</span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-950 dark:text-white">BillInsight AI</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Enterprise bill intelligence</span>
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
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                }`
              }
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-xs text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-brand-primary dark:bg-white/10 dark:text-slate-200">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="absolute inset-x-5 bottom-5 rounded-[22px] border border-indigo-200/70 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 dark:border-white/10 dark:from-indigo-500/10 dark:to-cyan-500/10">
          <p className="text-sm font-bold text-slate-950 dark:text-white">AI Confidence Active</p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">Bill, invoice, sales and dataset analysis with explainable outputs.</p>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/70 bg-white/70 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 lg:left-72">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent text-xs font-black text-white">BI</span>
          </Link>
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              className="h-11 w-full rounded-2xl border border-slate-200/80 bg-white/70 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/10 dark:text-white"
              placeholder="Search workspace..."
            />
          </div>
          <button className="hidden h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white/75 text-slate-600 transition hover:border-brand-primary hover:text-brand-primary dark:border-white/10 dark:bg-white/10 dark:text-slate-300 sm:grid" aria-label="Notifications">
            ◦
          </button>
          <button
            onClick={() => setDark((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white/75 text-xs font-bold text-slate-700 transition hover:border-brand-primary hover:text-brand-primary dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {dark ? "LT" : "DK"}
          </button>
          <button onClick={handleLogout} className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-white/75 px-3 text-left transition hover:border-brand-primary dark:border-white/10 dark:bg-white/10">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent text-xs font-bold text-white">{user.name?.[0] || "U"}</span>
            <span className="hidden sm:block">
              <span className="block text-xs font-bold text-slate-900 dark:text-white">{user.name || "User"}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Logout</span>
            </span>
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 rounded-[24px] border border-white/70 bg-white/85 p-2 shadow-premium backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80 lg:hidden">
        {navItems.map((item) => (
          <NavLink key={`${item.label}-mobile`} to={item.path} className={({ isActive }) => `grid place-items-center rounded-2xl py-2 text-[11px] font-bold ${isActive ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-500 dark:text-slate-300"}`}>
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
