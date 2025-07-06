import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/hilogame.css';

const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const cardRanks: Record<string, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13
};

const multipliersHigh: Record<string, number> = {
  A: 1.07, '2': 1.07, '3': 1.16, '4': 1.29, '5': 1.43,
  '6': 1.61, '7': 1.84, '8': 2.15, '9': 2.57, '10': 3.22,
  J: 4.12, Q: 6, K: 6
};

const multipliersLow: Record<string, number> = {
  A: 6, '2': 6, '3': 4.12, '4': 3.22, '5': 2.57,
  '6': 2.15, '7': 1.84, '8': 1.61, '9': 1.43, '10': 1.29,
  J: 1.16, Q: 1.07, K: 1.07
};

const winChances: Record<string, Record<string, number>> = {
  higher: {
    A: 0.7, '2': 0.65, '3': 0.6, '4': 0.5, '5': 0.45,
    '6': 0.4, '7': 0.35, '8': 0.28, '9': 0.22, '10': 0.18,
    J: 0.1, Q: 0.05, K: 0.0
  },
  lower: {
    A: 0.0, '2': 0.05, '3': 0.1, '4': 0.15, '5': 0.2,
    '6': 0.3, '7': 0.35, '8': 0.45, '9': 0.5, '10': 0.55,
    J: 0.6, Q: 0.65, K: 0.7
  }
};

function getRandomCard() {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return { suit, value };
}

function getMultiplier(guess: 'higher' | 'lower', value: string) {
  return guess === 'higher' ? multipliersHigh[value] : multipliersLow[value];
}

export default function HiloGame() {
  const [currentCard, setCurrentCard] = useState(getRandomCard());
  const [balance, setBalance] = useState(0);
  const [bet, setBet] = useState(10);
  const [inGame, setInGame] = useState(false);
  const [toast, setToast] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch('https://betmaster-backend.onrender.com/api/balance', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.balance !== undefined) {
        setBalance(data.balance);
        localStorage.setItem('balance', data.balance.toString());
      }
    } catch {
      const stored = localStorage.getItem('balance');
      if (stored) setBalance(parseInt(stored));
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const drawCardWithBias = (guess: 'higher' | 'lower') => {
    const prob = winChances[guess][currentCard.value];
    const shouldWin = Math.random() < prob;

    const currRank = cardRanks[currentCard.value];
    const possible = values.filter(v => {
      const rank = cardRanks[v];
      return guess === 'higher'
        ? shouldWin ? rank >= currRank : rank < currRank
        : shouldWin ? rank <= currRank : rank > currRank;
    });

    const value = possible[Math.floor(Math.random() * possible.length)];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    return { suit, value };
  };

  const startGame = async () => {
    if (bet < 10) return showToast('Minimum bet is ₹10');
    if (bet > balance) return showToast('Insufficient balance');

    const newBal = balance - bet;
    setBalance(newBal);
    setInGame(true);
    setMultiplier(1);
    setCurrentCard(getRandomCard());

    try {
      await fetch('https://betmaster-backend.onrender.com/api/balance', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newBalance: newBal })
      });
    } catch (err) {
      console.error('Balance update failed');
    }
  };

  const handleGuess = (guess: 'higher' | 'lower' | 'same') => {
    const nextCard = guess === 'same'
      ? { suit: suits[Math.floor(Math.random() * suits.length)], value: currentCard.value }
      : drawCardWithBias(guess);

    const won = guess === 'same'
      ? nextCard.value === currentCard.value
      : guess === 'higher'
        ? cardRanks[nextCard.value] >= cardRanks[currentCard.value]
        : cardRanks[nextCard.value] <= cardRanks[currentCard.value];

    if (won) {
      const nextMult = multiplier * getMultiplier(
        guess === 'same'
          ? cardRanks[currentCard.value] === 1 ? 'higher' : 'lower'
          : guess,
        currentCard.value
      );
      setMultiplier(parseFloat(nextMult.toFixed(2)));

      setTimeout(() => {
        setCurrentCard(nextCard);
      }, 800);
    } else {
      showToast('❌ You lost');
      setTimeout(() => {
        setInGame(false);
      }, 1500);
    }
  };

  const cashOut = async () => {
    const winnings = Math.floor(bet * multiplier);
    const newBal = balance + winnings;
    setBalance(newBal);
    setInGame(false);
    showToast(`✅ You won ₹${winnings}`);

    try {
      await fetch('https://betmaster-backend.onrender.com/api/balance', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newBalance: newBal })
      });
    } catch (e) {
      console.error('Error updating balance');
    }
  };

  const skipCard = () => {
    setCurrentCard(getRandomCard());
  };

  return (
    <div className="hilo-wrapper">
      <div className="hilo-navbar">
        <div className="navbar-left">bm</div>
        <div className="navbar-center">₹{balance}</div>
        <div className="navbar-right">
          <button className="back-button" onClick={() => navigate('/')}>← Back</button>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="game-body">
        <div className="card-container">
          <div className="skip-button" onClick={skipCard}>→</div>
          <img
            src={`/cards/${currentCard.suit}/${currentCard.value}.png`}
            alt="card"
            className="game-card"
          />
          <div className="controls">
            {currentCard.value !== 'K' ? (
              <button onClick={() => handleGuess('higher')} className="guess-button">▲ Higher or Same</button>
            ) : (
              <button onClick={() => handleGuess('same')} className="guess-button">▲ Same</button>
            )}

            {currentCard.value !== 'A' ? (
              <button onClick={() => handleGuess('lower')} className="guess-button">▼ Lower or Same</button>
            ) : (
              <button onClick={() => handleGuess('same')} className="guess-button">▼ Same</button>
            )}
          </div>
        </div>

        <div className="betting-section">
          {!inGame ? (
            <>
              <input
                type="number"
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                placeholder="Enter Bet Amount (min ₹10)"
              />
              <button className="start-button" onClick={startGame}>Place Bet</button>
            </>
          ) : (
            <button className="cashout-button" onClick={cashOut}>Cash Out</button>
          )}
          <div className="multiplier-display">Multiplier: {multiplier.toFixed(2)}x</div>
        </div>
      </div>
    </div>
  );
}
