import React from 'react';
import '../styles/style.css';

export default function FeaturesPage({ onNavigate }) {
  return (
    <div className="features-container" style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Our Core Features</h2>
      <p>Discover how the AI Student Assistant elevates your studying routine.</p>
      <div className="features-grid" style={{ margin: '40px 0' }}>
        <div className="feature-card"><h3>💬 AI Tutoring</h3><p>Instant breakdown of complex topics.</p></div>
        <div className="feature-card"><h3>📋 Tasks Manager</h3><p>Stay structured and hit deadlines.</p></div>
        <div className="feature-card"><h3>📅 Study Planner</h3><p>Custom-built study calendars automatically generated.</p></div>
      </div>
      <button className="btn-primary" onClick={() => onNavigate('home')}>Back to Home</button>
    </div>
  );
}