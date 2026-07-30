import { useState } from "react";
export default function LoginForm({ onSubmit }) {
  const [form, setForm] = useState({ email: "", password: "" });
  return (
    <div className="flex flex-col gap-3">
      <input className="rounded border-2 border-[var(--border)] bg-white p-2 font-semibold text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)]" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      <input className="rounded border-2 border-[var(--border)] bg-white p-2 font-semibold text-[var(--text-primary)] shadow-[2px_2px_0_rgba(17,24,39,0.9)]" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      <button className="rounded border-2 border-[var(--border)] bg-[var(--accent)] p-2 font-bold text-white shadow-[4px_4px_0_rgba(17,24,39,0.9)]" onClick={() => onSubmit(form)}>Login</button>
    </div>
  );
}
