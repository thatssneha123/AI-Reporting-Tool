import { useState } from "react";
export default function LoginForm({ onSubmit }) {
  const [form, setForm] = useState({ email: "", password: "" });
  return (
    <div className="flex flex-col gap-3">
      <input className="border p-2 rounded" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      <input className="border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      <button className="bg-indigo-600 text-white p-2 rounded" onClick={() => onSubmit(form)}>Login</button>
    </div>
  );
}
