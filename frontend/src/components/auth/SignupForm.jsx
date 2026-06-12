import { useState } from "react";
export default function SignupForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  return (
    <div className="flex flex-col gap-3">
      <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
      <input className="border p-2 rounded" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      <input className="border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
      <button className="bg-indigo-600 text-white p-2 rounded" onClick={() => onSubmit(form)}>Sign Up</button>
    </div>
  );
}
