import { useNavigate } from "react-router-dom";
export default function UploadButton() {
  const navigate = useNavigate();
  return <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => navigate("/upload")}>+ Upload Dataset</button>;
}
