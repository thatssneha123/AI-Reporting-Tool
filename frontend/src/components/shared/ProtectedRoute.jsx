import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] font-black text-[var(--text-primary)]">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}
