import React from 'react';
import '../styles/style.css';

export default function AboutPage({ onNavigate }) {
  return (
    <div className="about-container" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2>About Our Platform</h2>
      <p style={{ marginTop: '20px', color: '#64748b', lineHeight: '1.6' }}>
        Built in 2026, the AI Student Assistant leverages intelligent models to give students a personal, 24/7 tutor and structural helper. Our goal is to make high-quality educational guidance accessible to everyone.
      </p>
      <button className="btn-primary" style={{ marginTop: '30px' }} onClick={() => onNavigate('home')}>Back to Home</button>
    </div>
  );
}