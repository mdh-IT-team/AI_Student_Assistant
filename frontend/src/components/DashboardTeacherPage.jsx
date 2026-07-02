import React from 'react';
import '../styles/style.css';

export default function DashboardTeacherPage({ onNavigate }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            <li><a href="#dash" className="sidebar-item active">📊 Dashboard</a></li>
            <li><a href="#modules" className="sidebar-item">📚 My Modules</a></li>
            <li><a href="#students" className="sidebar-item">👥 My Students</a></li>
            <li><a href="#grading" className="sidebar-item">📝 Grading</a></li>
            <li><a href="#aichat" className="sidebar-item">🔮 AI Assistant</a></li>
            <li><a href="#progress" className="sidebar-item">📈 Class Progress</a></li>
            <li><a href="#settings" className="sidebar-item">⚙️ Settings</a></li>
          </ul>
        </div>
        <a href="#logout" className="sidebar-logout" onClick={() => onNavigate('home')}>🚪 Logout</a>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <input type="text" placeholder="Search anything..." className="search-bar" />
          <div className="header-actions">
            <span>🔔</span>
            <div className="profile-widget">
              <div className="avatar"></div>
              <span>Hi, Prof. Smith! ▾</span>
            </div>
          </div>
        </header>

        <div className="welcome-widget">
          <h2>Hello, Prof. Smith! 👋</h2>
          <p style={{color: '#64748b'}}>Here's what's happening in your classes today.</p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>32</h3>
            <p>Total Students 👥</p>
          </div>
          <div className="stat-card">
            <h3>3</h3>
            <p>Modules Teaching 📚</p>
          </div>
          <div className="stat-card">
            <h3>8</h3>
            <p>To Grade 📝</p>
          </div>
          <div className="stat-card">
            <h3>74%</h3>
            <p>Average Progress ✅</p>
          </div>
        </section>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>AI Assistant</h3>
            </div>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
              Hi Prof. Smith! Ask me to summarize class performance or draft feedback.
            </p>
            <div className="chat-input-container">
              <input type="text" placeholder="Ask me anything..." className="chat-input" />
              <button className="btn-primary">Send</button>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Student Progress</h3>
              <a href="#students">View all</a>
            </div>
            <div className="task-item">
              <div>
                <label>Anna Petrović</label>
                <div style={{fontSize: '0.75rem', color: '#64748b'}}>Web Development</div>
              </div>
              <span className="badge low">On track</span>
            </div>
            <div className="task-item">
              <div>
                <label>Marko Jovanović</label>
                <div style={{fontSize: '0.75rem', color: '#64748b'}}>Databases</div>
              </div>
              <span className="badge medium">Behind</span>
            </div>
            <div className="task-item">
              <div>
                <label>Ivana Nikolić</label>
                <div style={{fontSize: '0.75rem', color: '#64748b'}}>Web Development</div>
              </div>
              <span className="badge high">Needs attention</span>
            </div>
          </div>
        </div>

        <h3>Submissions to Review</h3>
        <section className="recommendations-grid" style={{marginTop: '15px'}}>
          <div className="rec-card">
            <h4>Assignment 3 — Web Development</h4>
            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>5 submissions pending</p>
          </div>
          <div className="rec-card">
            <h4>Quiz 2 — Databases</h4>
            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>2 submissions pending</p>
          </div>
          <div className="rec-card">
            <h4>Project Draft — Algorithms</h4>
            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>1 submission pending</p>
          </div>
        </section>
      </main>
    </div>
  );
}