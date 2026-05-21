import React, { useState } from 'react';
import '../styles/style.css';

export default function ForgetPage({ onNavigate }) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ fontSize: '3rem' }}>🔑</div>
        <h2>Forgot Password?</h2>
        
        {!submitted ? (
          <>
            <p>Please contact the provider.</p>
            
            
          </>
        ) : (
          <div style={{ margin: '20px 0', padding: '15px', background: '#dcfce7', borderRadius: '8px', color: '#166534' }}>
            <strong>Success!</strong> Your request has been sent to the provider. They will review it and reach out shortly.
          </div>
        )}

        <div className="divider">System Provider Contact</div>
        
        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem', marginBottom: '20px' }}>
          <p style={{ marginBottom: '5px' }}><strong>Email:</strong> support@mdh-it-team.com</p>
          <p><strong>Hours:</strong> Mon - Fri, 9:00 AM - 5:00 PM</p>
        </div>

        <p style={{ fontSize: '0.9rem' }}>
          Remember your password?{' '}
          <span 
            onClick={() => onNavigate('login')} 
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '600' }}
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
}