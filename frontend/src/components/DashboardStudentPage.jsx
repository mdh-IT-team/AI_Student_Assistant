import React, { useState, useEffect } from 'react';
import '../styles/style.css';

export default function DashboardStudentPage({ onNavigate }) {
  const [chatMessage, setChatMessage] = useState('');
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || user.email?.split('@')[0] || 'Student');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleSendChat = () => {
    if (chatMessage) {
      // TODO: AI tutor logic here
      console.log('Chat message:', chatMessage);
      alert(`AI Tutor: Let me help you with "${chatMessage}"`);
      setChatMessage('');
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('home');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            <li><a href="#dash" className="sidebar-item active"> Dashboard</a></li>
            <li><a href="#tutor" className="sidebar-item"> AI Tutor</a></li>
            <li><a href="#tasks" className="sidebar-item"> Assignement</a></li>
            <li><a href="#planner" className="sidebar-item">Modules Assigned</a></li>
            <li><a href="#notes" className="sidebar-item">Grades</a></li>
            <li><a href="#settings" className="sidebar-item">Settings</a></li>
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
              <span>Hi, UserName! ▾</span>
            </div>
          </div>
        </header>

        <div className="welcome-widget">
          <h2>Hello, UserName! 👋</h2>
          <p style={{color: '#64748b'}}>Let's make today productive!</p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>3</h3>
            <p>Assignment Due Today 
            </p>
          </div>
          <div className="stat-card">
            <h3>2</h3>
            <p>Classes Today</p>
          </div>
        </section>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>AI Tutor</h3>
            </div>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
              Hi {userName}! What would you like to learn today?
            </p>
            <div className="chat-input-container">
              <input type="text" 
              placeholder="Ask me anything..." 
              className="chat-input"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} />
              <button className="btn-primary" onClick={handleSendChat}>Send</button>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Today's Assignments</h3>
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

       
      </main>
    </div>
  );
}