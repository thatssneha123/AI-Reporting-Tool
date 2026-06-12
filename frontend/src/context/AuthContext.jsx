import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
export const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const data = await authService.getMe();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateSession();
  }, []);

  useEffect(() => { user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user"); }, [user]);
  const logout = () => { setUser(null); authService.logout(); };
  return <AuthContext.Provider value={{ user, setUser, logout, loading }}>{children}</AuthContext.Provider>;
};
