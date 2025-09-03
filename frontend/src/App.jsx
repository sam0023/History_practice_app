import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import ApHistoryHome from "./pages/ApHistory/ApHistoryHome";
import PolityHome from "./pages/Polity/PolityHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history/*" element={<ApHistoryHome />} />
        <Route path="/polity/*" element={<PolityHome />} />
      </Routes>
    </Router>
  );
}

export default App;
