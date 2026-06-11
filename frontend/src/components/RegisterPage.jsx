import React, {useState } from 'react';
import { registerUser } from '../services/api.js';
import '../styles/style.css';

export default function RegisterPage({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(email, password, fullName);
      // Show registration success message, or take back to login Page
      alert('Registration successful! Please login to continue.');
    // After registering, automatically send them to the login screen
    onNavigate('login');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
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
            <input type="text" placeholder="Enter your full name" className="input-field" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required disabled={loading} />
          </div>

          <div className="input-group">
            <label>Email address</label>
            <input type="email" placeholder="name@example.com" className="input-field" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required disabled={loading} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" className="input-field" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required disabled={loading} />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

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
  )
}