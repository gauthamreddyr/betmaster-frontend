import { useEffect, useState } from 'react';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [balance, setBalance] = useState<number>(0);
  const name = localStorage.getItem('name') || 'User';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch('https://betmaster-backend.onrender.com/api/balance', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
        localStorage.setItem('balance', data.balance.toString());
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      const storedBalance = localStorage.getItem('balance');
      if (storedBalance) setBalance(parseInt(storedBalance));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-navbar">
        <div className="navbar-left">bm</div>
        <div className="navbar-center">₹{balance}</div>
        <div className="navbar-right">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="welcome-card">
        <h2>Welcome, {name}</h2>
        <p>Select a game to start playing</p>
      </div>

      <div className="game-grid">
        <div className="game-card" onClick={() => window.location.href = '/game'}>
          <img src="/dice-game.jpg" alt="HiLo" className="game-thumbnail" />
          <h3>HiLo Game</h3>
        </div>
      </div>
    </div>
  );
}
