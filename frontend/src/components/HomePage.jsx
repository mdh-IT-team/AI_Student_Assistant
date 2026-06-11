import React from 'react';
import '../styles/style.css';

export default function HomePage({ onNavigate }) {
  return (
    <div className="homepage-wrapper">
      <nav className="navbar">
        <div className="logo">🤖 AI Student Assistant</div>
        <ul className="nav-links">
          <li><span onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>Home</span></li>
          <li><span onClick={() => onNavigate('features')} style={{ cursor: 'pointer' }}>Features</span></li>
          <li><span onClick={() => onNavigate('about')} style={{ cursor: 'pointer' }}>About</span></li>
        </ul>
        <button className="btn-primary" onClick={() => onNavigate('login')}>Login</button>
      </nav>

      <section className="hero-section">
        <div className="hero-content">
          <h1>Your <span>AI Study Companion</span></h1>
          <p>Get instant help with your studies, manage tasks, and achieve your academic goals with AI.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => onNavigate('login')}>Get Started</button>
            <button className="btn-outline">Learn More →</button>
          </div>
        </div>
        <div className="hero-image">
          <div style={{fontSize: '8rem'}}>🤖📚</div>
        </div>
      </section>

      <section className="features-container">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">💬</div>
            <h3>AI Tutoring</h3>
            <p>Get explanations and answers to your questions instantly.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📋</div>
            <h3>Task Manager</h3>
            <p>Organize assignments, set deadlines, and stay on track.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📅</div>
            <h3>Study Planner</h3>
            <p>Plan your study schedule and boost your productivity.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Track your progress and achieve your academic goals.</p>
          </div>
        </div>

        <div className="promo-banner">
          <div>
            <h3>Smarter Study. Better Results.</h3>
            <p style={{color: '#64748b', marginTop: '5px'}}>Join thousands of students who are learning smarter with AI.</p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('login')}>Get Started for Free</button>
        </div>
      </section>

      <footer className="footer">
        <div>&copy; 2026 AI Student Assistant</div>
        <div className="footer-links">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}