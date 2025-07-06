import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import HiloGame from './components/HiloGame';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/game" element={isAuthenticated ? <HiloGame /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
