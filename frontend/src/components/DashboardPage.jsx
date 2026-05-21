import React from 'react';
import '../styles/style.css';

export default function DashboardPage({ onNavigate }) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            <li><a href="#dash" className="sidebar-item active">📊 Dashboard</a></li>
            <li><a href="#tutor" className="sidebar-item">🔮 AI Tutor</a></li>
            <li><a href="#tasks" className="sidebar-item">📋 Tasks</a></li>
            <li><a href="#planner" className="sidebar-item">📅 Study Planner</a></li>
            <li><a href="#notes" className="sidebar-item">📝 Notes</a></li>
            <li><a href="#progress" className="sidebar-item">📈 Progress</a></li>
            <li><a href="#resources" className="sidebar-item">📁 Resources</a></li>
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
              <span>Hi, Alex! ▾</span>
            </div>
          </div>
        </header>

        <div className="welcome-widget">
          <h2>Hello, Alex! 👋</h2>
          <p style={{color: '#64748b'}}>Let's make today productive!</p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>3</h3>
            <p>Tasks Due Today 📋</p>
          </div>
          <div className="stat-card">
            <h3>2</h3>
            <p>Classes Today 🗓️</p>
          </div>
          <div className="stat-card">
            <h3>85%</h3>
            <p>Average Progress ✅</p>
          </div>
          <div className="stat-card">
            <h3>12</h3>
            <p>Study Streak (Days) 🔥</p>
          </div>
        </section>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>AI Tutor</h3>
            </div>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
              Hi Alex! What would you like to learn today?
            </p>
            <div className="chat-input-container">
              <input type="text" placeholder="Ask me anything..." className="chat-input" />
              <button className="btn-primary">Send</button>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Today's Tasks</h3>
              <a href="#tasks">View all</a>
            </div>
            <div className="task-item">
              <div>
                <input type="checkbox" id="t1" /> <label htmlFor="t1">Math Assignment</label>
                <div style={{fontSize: '0.75rem', color: '#64748b'}}>Due in 2 hours</div>
              </div>
              <span className="badge high">High</span>
            </div>
            <div className="task-item">
              <div>
                <input type="checkbox" id="t2" /> <label htmlFor="t2">Science Project</label>
                <div style={{fontSize: '0.75rem', color: '#64748b'}}>Due tomorrow</div>
              </div>
              <span className="badge medium">Medium</span>
            </div>
          </div>
        </div>

        <h3>Recommended For You</h3>
        <section className="recommendations-grid" style={{marginTop: '15px'}}>
          <div className="rec-card">
            <h4>How to Solve Quadratic Equations</h4>
            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>Video • 15 min</p>
          </div>
          <div className="rec-card">
            <h4>Study Tips for Better Focus</h4>
            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>Article • 8 min</p>
          </div>
          <div className="rec-card">
            <h4>Time Management Guide</h4>
            <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '5px'}}>PDF • 12 min</p>
          </div>
        </section>
      </main>
    </div>
  );
}