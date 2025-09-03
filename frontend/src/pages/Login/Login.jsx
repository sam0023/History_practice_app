import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/home");
  };
  return (
    <div className="login-container">
      <h2>Login</h2>
      <input type="text" placeholder="User ID" />
      <input type="password" placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
