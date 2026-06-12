import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setServerError("");
    try {
      const data = await authService.login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Welcome back. Sign in to continue to your analytics dashboard.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-indigo-400">Forgot password?</Link>
        </div>
        {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        <Button className="w-full" loading={loading}>Login</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">New here? <Link to="/signup" className="font-semibold text-indigo-400">Create account</Link></p>
    </AuthLayout>
  );
}
