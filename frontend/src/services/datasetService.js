import api from "./api";
export const datasetService = {
  upload: (file) => { const fd = new FormData(); fd.append("file", file); return api.post("/dataset/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }); },
  getHistory: () => api.get("/dataset/history"),
  deleteDataset: (id) => api.delete(`/dataset/${id}`),
};
