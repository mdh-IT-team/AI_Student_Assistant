import React, { useState } from 'react';
import '../styles/style.css';
import { fetchRole, pageForRole } from '../auth';

export default function LoginPage({ onNavigate }) {
  // 1. Add state to hold the input values and potential errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // Send the login request to the FastAPI backend
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === 'Success') {
        // CRITICAL: Save the JWT token to the browser's local storage
        localStorage.setItem('token', data.token);

        // Ask the backend for this user's role, then route accordingly.
        const role = await fetchRole();
        if (role) {
          onNavigate(pageForRole(role));
        } else {
          setError('Logged in, but could not determine your role.');
        }
      } else {
        // Show errors from the backend (like "Wrong email or password")
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{fontSize: '3rem'}}>🤖</div>
        <h2>Welcome Back!</h2>
        <p>Login to continue your learning journey.</p>

        {/* Display errors if they happen */}
        {error && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '10px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="input-field"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-options">
            <a href="#forgot"
            onClick={() => onNavigate('forgot')}
            style={{color: '#4f46e5', textDecoration: 'none'}}>Forgot Password?</a>
          </div>

          <button type="submit" className="btn-primary btn-block">Login</button>
        </form>

        <p style={{marginTop: '20px', fontSize: '0.9rem'}}>
          Don't have an account?<br></br>

          <span
          onClick={() => onNavigate('register')}
            style={{color: '#4f46e5', textDecoration: 'none', cursor: 'pointer'}}>
            Register here
            </span>
        </p>
      
      </div>
    </div>
  );
}