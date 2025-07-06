import '../styles/auth.css';
import AuthModal from './AuthModal';
import { useState } from 'react';

export default function Landing() {
  const [showModal, setShowModal] = useState<'login' | 'signup' | null>(null);

  return (
    <div className="landing-container">
      <header className="header">
        <h1 className="logo">BetMaster</h1>
        <div className="auth-buttons">
          <button className="btn" onClick={() => setShowModal('signup')}>Sign Up</button>
          <button className="btn-outline" onClick={() => setShowModal('login')}>Log In</button>
        </div>
      </header>

      <main className="hero">
        <h2 className="tagline">Your game begins here.</h2>
        <p className="subtext">Simple. Secure. Skill-based games with real rewards.</p>
      </main>

      {showModal && <AuthModal type={showModal} onClose={() => setShowModal(null)} />}
    </div>
  );
}
