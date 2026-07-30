import { useNavigate } from "react-router-dom";
export default function UploadButton() {
  const navigate = useNavigate();
  return <button className="rounded border-2 border-[var(--border)] bg-[var(--accent)] px-4 py-2 font-bold text-white shadow-[4px_4px_0_rgba(17,24,39,0.9)]" onClick={() => navigate("/upload")}>+ Upload Dataset</button>;
}
