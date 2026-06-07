import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MessagesPage from './pages/MessagesPage';
import RequestsPage from './pages/RequestsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import PostRequestPage from './pages/PostRequestPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SafetyPage from './pages/SafetyPage';
import AdminPage from './pages/AdminPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/requests/new" element={<PostRequestPage />} />
        <Route path="/requests/my" element={<MyRequestsPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/safety" element={<SafetyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
