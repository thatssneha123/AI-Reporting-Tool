import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "https://ai-reporting-backend-gric.onrender.com" });
api.interceptors.request.use(config => { const t = localStorage.getItem("token"); if (t) config.headers.Authorization = `Bearer ${t}`; return config; });
api.interceptors.response.use(r => r.data, e => Promise.reject(e.response?.data || e));
export default api;
