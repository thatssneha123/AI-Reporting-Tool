import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import OtpInput from "../components/auth/OtpInput";
import Button from "../components/shared/Button";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const email = location.state?.email;
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.verifyOtp({ email, otp });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);
    try {
      const data = await authService.resendOtp(email);
      setMessage(data.message || "A new OTP has been sent");
      setSeconds(60);
    } catch (err) {
      setError(err.message || "Unable to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`Enter the 6-digit code sent to ${email || "your email"}.`}>
      <form className="space-y-5" onSubmit={handleVerify}>
        <OtpInput value={otp} onChange={setOtp} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}
        <Button className="w-full" loading={loading}>Verify</Button>
      </form>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <Link to="/signup" className="font-semibold text-gray-400">Change email</Link>
        <Button type="button" variant="ghost" loading={resending} disabled={seconds > 0} onClick={handleResend}>
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
        </Button>
      </div>
    </AuthLayout>
  );
}
