import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import ChatPage from './components/ChatPage.jsx';
function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={user ? <ChatPage /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
