import React, { useState, useEffect } from 'react';
import '../styles/style.css';
import { logout, fetchMe } from '../auth';
import { fetchDashboard } from '../api';

export default function DashboardStudentPage({ onNavigate }) {
  const [modules, setModules] = useState([]);
  const [semester, setSemester] = useState('—');
  const [userName, setUserName] = useState('Student');
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMe().then(user => {
      if (user) setUserName(user.name || user.email?.split('@')[0] || 'Student');
    });

    fetchDashboard('student')
      .then(data => {
        const names = (data.studying_modules || '')
          .split(',')
          .map(m => m.trim())
          .filter(Boolean);
        setModules(names);
        setSemester(data.semester || 'Not specified');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSendChat() {
    if (!chatMessage) return;
    alert(`AI Tutor: Let me help you with "${chatMessage}"`);
    setChatMessage('');
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            <li><a href="#dash" className="sidebar-item active">📊 Dashboard</a></li>
            <li><a href="#modules" className="sidebar-item">📚 My Modules</a></li>
            <li><a href="#aichat" className="sidebar-item">🔮 AI Tutor</a></li>
            <li><a href="#settings" className="sidebar-item">⚙️ Settings</a></li>
          </ul>
        </div>
        <a href="#logout" className="sidebar-logout" onClick={() => { logout(); onNavigate('home'); }}>🚪 Logout</a>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <input type="text" placeholder="Search anything..." className="search-bar" />
          <div className="header-actions">
            <span>🔔</span>
            <div className="profile-widget">
              <div className="avatar"></div>
              <span>Hi, {userName}! ▾</span>
            </div>
          </div>
        </header>

        <div className="welcome-widget">
          <h2>Hello, {userName}! 👋</h2>
          <p style={{ color: '#64748b' }}>Let's make today productive!</p>
        </div>

        {loading && <p>Loading your dashboard…</p>}
        {error && <p style={{ color: '#ef4444' }}>Could not load dashboard: {error}</p>}

        {!loading && !error && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <h3>{modules.length}</h3>
                <p>Modules Enrolled 📚</p>
              </div>
              <div className="stat-card">
                <h3>{semester}</h3>
                <p>Current Semester 🗓️</p>
              </div>
            </section>

            <div className="dashboard-grid" style={{ marginTop: '25px' }}>
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h3>My Modules</h3>
                  <span className="badge low">{modules.length} total</span>
                </div>
                {modules.map((m, i) => (
                  <div className="task-item" key={i}>
                    <span>📖 {m}</span>
                  </div>
                ))}
                {modules.length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    You are not enrolled in any modules yet.
                  </p>
                )}
              </div>

              <div className="dashboard-panel">
                <div className="panel-header"><h3>AI Tutor</h3></div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
                  Hi {userName}! What would you like to learn today?
                </p>
                <div className="chat-input-container">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="chat-input"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  />
                  <button className="btn-primary" onClick={handleSendChat}>Send</button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}