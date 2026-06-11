import React, { useState } from 'react';
import { loginUser } from '../services/api.js';
import '../styles/style.css';

export default function LoginPage({ onNavigate }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try{
      await loginUser(email, password);

    
    onNavigate('dashboard');
  } catch (err) {
    setError(err);
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

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email address</label>
            <input type="email" placeholder="name@example.com" className="input-field" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required disabled={loading} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" className="input-field" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required disabled={loading} />
          </div>

          <div className="login-options">
            <a href="#forgot" 
            onClick={() => onNavigate('forgot')} 
            style={{color: '#4f46e5', textDecoration: 'none'}}>Forgot Password?</a>
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
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