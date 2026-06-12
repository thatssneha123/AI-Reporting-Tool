import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import { authService } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      navigate("/reset-password", { state: { email: data.email } });
    } catch (err) {
      setError(err.message || "Unable to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="We will send a reset OTP to your verified email address.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} error={error} onChange={(e) => setEmail(e.target.value)} />
        <Button className="w-full" loading={loading}>Send OTP</Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400"><Link to="/login" className="font-semibold text-indigo-400">Back to login</Link></p>
    </AuthLayout>
  );
}
