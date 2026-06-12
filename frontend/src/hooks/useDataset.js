import { useState } from "react";
import { datasetService } from "../services/datasetService";
export const useDataset = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchHistory = async () => { setLoading(true); try { setDatasets(await datasetService.getHistory()); } finally { setLoading(false); } };
  return { datasets, loading, fetchHistory };
};
