import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import ApHistoryHome from './subjects/ApHistory/ApHistoryHome/ApHistoryHome';
import Chapters from './subjects/ApHistory/Chapters/Chapters';
import ChapterPage from './subjects/ApHistory/ChapterPage/ChapterPage';
import LearningPage from './subjects/ApHistory/LearningPage/LearningPage';
import SubtopicPage from './subjects/ApHistory/SubtopicPage/SubtopicPage';
import PolityHome from './subjects/Polity/PolityHome/PolityHome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<ApHistoryHome />} />
        <Route path="/chapters/:period" element={<Chapters />} />
        <Route path="/chapter/:id" element={<ChapterPage />} />
        <Route path="/chapter/:id/learning" element={<LearningPage />} />
        <Route path="/subtopic/:id" element={<SubtopicPage />} />
        <Route path="/polity" element={<PolityHome />} />
      </Routes>
    </Router>
  );
}
export default App;