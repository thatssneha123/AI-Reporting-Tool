import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import OtpInput from "../components/auth/OtpInput";
import Button from "../components/shared/Button";
import Input from "../components/shared/Input";
import { authService } from "../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) navigate("/forgot-password", { replace: true });
  }, [email, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.resetPassword({ email, otp, newPassword });
      setSuccess(data.message || "Password reset successfully");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle={`Enter the reset OTP sent to ${email || "your email"} and choose a new password.`}>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <OtpInput value={otp} onChange={setOtp} />
        <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <Button className="w-full" loading={loading}>Reset Password</Button>
      </form>
    </AuthLayout>
  );
}
