import React from 'react';
import '../styles/style.css';

export default function DashboardAdminPage({ onNavigate }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            
            <li><a href="#teacher" className="sidebar-item active">Teachers</a></li>
            <li><a href="#student" className="sidebar-item">Students</a></li>
            <li><a href="#aichat" className="sidebar-item">AI Chat</a></li>
            <li><a href="#settings" className="sidebar-item"> Settings</a></li>
          </ul>
        </div>
        <a href="#logout" className="sidebar-logout" onClick={() => onNavigate('home')}>Logout</a>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <input type="text" placeholder="Search anything..." className="search-bar" />
          <div className="header-actions">
            <span>🔔</span>
            <div className="profile-widget">
              <div className="avatar"></div>
              <span>Hi, USERNAME</span>
            </div>
          </div>
        </header>

        <div className="welcome-widget">
          <h2>Hello, USERNAME</h2>
          <p style={{color: '#64748b'}}>Let's make today productive!</p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>5</h3>
            <p>Number of Teachers</p>
          </div>
          <div className="stat-card">
            <h3>20</h3>
            <p>Number of Students</p>
          </div>
          <div className="stat-card">
            <h3>10</h3>
            <p>Number of Modules</p>
          </div>
          
          
        </section>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Add new Teacherr</h3>
            </div>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
              Teacher Email
            </p>
            <div className="chat-input-container">
              <input type="text" placeholder="Email" className="chat-input" />
              <button className="btn-primary">Send to create</button>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>AI Chat</h3>
            </div>
            <div className="chat-input-container">
              <input type="text" placeholder="Talk to me" className="chat-input" />
              <button className="btn-primary">Send</button>
            </div>
          </div>
        </div>

       
      </main>
    </div>
  );
}