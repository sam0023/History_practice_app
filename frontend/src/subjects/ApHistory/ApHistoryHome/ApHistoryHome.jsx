import { useNavigate } from "react-router-dom";
import "./ApHistoryHome.css";

function ApHistoryHome() {
  const navigate = useNavigate();
  return (
    <div className="aphistory-home">
      <h2>Select Period</h2>
      {['Ancient', 'Medieval', 'Modern'].map((p) => (
        <button
          key={p}
          onClick={() => navigate(`/chapters/${p}`)}
          style={{ display: 'block', margin: '10px' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
export default ApHistoryHome;