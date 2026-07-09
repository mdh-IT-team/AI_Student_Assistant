import React, { useState } from 'react';

export default function RegisterPage({ onNavigate }) {
  // 1. Add state to hold the input values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // Send the captured data to your FastAPI backend
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name: name }),
      });

      const data = await response.json();

      if (data.status === 'Success') {
        alert('Account created successfully! You can now log in.');
        onNavigate('login');
      } else {
        // Show validation errors from the backend (like "Email already registered")
        setError(data.message);
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
    }
  };

  // 3. The UI remains exactly as designed
  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ fontSize: '3rem' }}>🤖</div>
        <h2>Create Account</h2>
        <p>Join us to start your smarter learning journey.</p>

        {/* Display errors if they happen */}
        {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="input-field"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="••••••••"
              className="input-field"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary btn-block">Sign Up</button>
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
  );
}