import api from "./api";
export const queryService = { analyze: (data) => api.post("/analyze", data) };
