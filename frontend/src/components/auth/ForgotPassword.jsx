import { useState } from "react";
export default function ForgotPassword({ onSubmit }) {
  const [email, setEmail] = useState("");
  return (
    <div className="flex flex-col gap-3">
      <input className="border p-2 rounded" type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
      <button className="bg-indigo-600 text-white p-2 rounded" onClick={() => onSubmit(email)}>Send Reset Link</button>
    </div>
  );
}
