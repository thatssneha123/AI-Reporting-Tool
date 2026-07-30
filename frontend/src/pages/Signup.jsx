import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
export default function Signup() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await authService.signup(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Start with your details and continue to your dashboard.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Full Name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {serverError && <p className="text-sm font-bold text-[var(--danger)]">{serverError}</p>}
        <Button className="w-full" loading={loading}>Sign Up</Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-[var(--text-secondary)]">Already have an account? <Link to="/login" className="font-bold text-[var(--accent-2)] underline decoration-2 underline-offset-4">Login</Link></p>
    </AuthLayout>
  );
}
