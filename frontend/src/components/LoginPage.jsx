import React from 'react';
import '../styles/style.css';

export default function LoginPage({ onNavigate }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNavigate('dashboard');
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
            <input type="email" placeholder="name@example.com" className="input-field" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" className="input-field" required />
          </div>

          <div className="login-options">
            <label><input type="checkbox" /> Remember me</label>
            <a href="#forgot" style={{color: '#4f46e5', textDecoration: 'none'}}>Forgot Password?</a>
          </div>

          <button type="submit" className="btn-primary btn-block">Login</button>
        </form>

       

        

        <p style={{marginTop: '20px', fontSize: '0.9rem'}}>
          Don't have an account?
          <span 
          onClick={() => onNavigate('register')} 
          style={{color: '#4f46e5', textDecoration: 'none'}}>
            Register here
            </span>
        </p>
      </div>
    </div>
  );
}