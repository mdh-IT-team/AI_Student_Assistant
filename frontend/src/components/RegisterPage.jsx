import React from 'react';
import '../styles/style.css';

export default function RegisterPage({ onNavigate }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // After registering, automatically send them to the login screen
    onNavigate('login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ fontSize: '3rem' }}>🤖</div>
        <h2>Create Account</h2>
        <p>Join us to start your smarter learning journey.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" className="input-field" required />
          </div>

          <div className="input-group">
            <label>Email address</label>
            <input type="email" placeholder="name@example.com" className="input-field" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" className="input-field" required />
          </div>

          <button type="submit" className="btn-primary btn-block">Sign Up</button>
        </form>

        <div className="divider">or</div>

        <button className="btn-outline btn-block" onClick={() => onNavigate('dashboard')}>
          Sign up with Google
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <span 
            onClick={() => onNavigate('login')} 
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '600' }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}