import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingpagePage from './pages/legacy/LandingpagePage';
import AboutPage from './pages/legacy/AboutPage';
import ForgetPasswordPage from './pages/legacy/ForgetPasswordPage';
import HireworkerPage from './pages/legacy/HireworkerPage';
import HowToHirePage from './pages/legacy/HowToHirePage';
import HowToWorkPage from './pages/legacy/HowToWorkPage';
import LoginUserPage from './pages/legacy/LoginUserPage';
import LoginWorkerPage from './pages/legacy/LoginWorkerPage';
import SignupUserPage from './pages/legacy/SignupUserPage';
import SignupWorkerPage from './pages/legacy/SignupWorkerPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingpagePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/forget_password" element={<ForgetPasswordPage />} />
        <Route path="/hireworker" element={<HireworkerPage />} />
        <Route path="/howToHire" element={<HowToHirePage />} />
        <Route path="/howToWork" element={<HowToWorkPage />} />
        <Route path="/login_user" element={<LoginUserPage />} />
        <Route path="/login_worker" element={<LoginWorkerPage />} />
        <Route path="/signup_user" element={<SignupUserPage />} />
        <Route path="/signup_worker" element={<SignupWorkerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
