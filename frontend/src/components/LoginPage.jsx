import React, { useState } from 'react';
import '../styles/style.css';

export default function LoginPage({ onNavigate }) {
  // 1. Add state to hold the input values and potential errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setLoading(true);

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
        localStorage.setItem('user', JSON.stringify(data.user || { email, role: data.role || 'student' })); // Save user info if needed

        // Navigate to the secure dashboard
        const role = data.role || 'student';
        switch (role.toLowerCase()) {
          case 'admin':
            onNavigate('admindashboard');
            break;
          case 'teacher':
            onNavigate('teacherdashboard');
            break;
          case 'student':
          default:
            onNavigate('dashboard');
            break;
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
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
              disabled={loading}
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
              disabled={loading}
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