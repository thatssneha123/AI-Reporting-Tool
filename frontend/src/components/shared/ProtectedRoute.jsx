import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}
