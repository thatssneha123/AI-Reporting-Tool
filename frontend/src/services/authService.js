import api from "./api";
export const authService = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getMe: () => api.get("/auth/me"),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
