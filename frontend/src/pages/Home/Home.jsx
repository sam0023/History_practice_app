import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <h2>Select Subject</h2>
      <button onClick={() => navigate("/history")}>AP History</button>
      <button onClick={() => navigate("/polity")}>Polity</button>
    </div>
  );
}
export default Home;