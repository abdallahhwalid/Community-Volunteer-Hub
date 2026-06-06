import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MessagesPage from './pages/MessagesPage';
import RequestsPage from './pages/RequestsPage';
import MyRequestsPage from './pages/MyRequestsPage';   // Added this line
import PostRequestPage from './pages/PostRequestPage'; // Added this line

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        
        {/* Added your two new routes below */}
        <Route path="/requests/new" element={<PostRequestPage />} />
        <Route path="/requests/my" element={<MyRequestsPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;