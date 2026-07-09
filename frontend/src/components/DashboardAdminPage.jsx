import React, { useState, useEffect } from 'react';
import '../styles/style.css';

export default function DashboardAdminPage({ onNavigate }) {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || user.email?.split('@')[0] || 'Admin');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleAddTeacher = () => {
    if (teacherEmail) {
      // TODO: Add teacher logic here with Supabase
      console.log('Adding teacher:', teacherEmail);
      alert(`Teacher invitation sent to ${teacherEmail}`);
      setTeacherEmail('');
    } else {
      alert('Please enter a teacher email');
    }
  };

  const handleSendChat = () => {
    if (chatMessage) {
      // TODO: AI chat logic here
      console.log('Chat message:', chatMessage);
      // Simulate AI response
      alert(`AI: I received your message: "${chatMessage}"`);
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
            <li><a href="#teacher" className="sidebar-item active">👨‍🏫 Teachers</a></li>
            <li><a href="#student" className="sidebar-item">👩‍🎓 Students</a></li>
            <li><a href="#aichat" className="sidebar-item">🤖 AI Chat</a></li>
            <li><a href="#settings" className="sidebar-item">⚙️ Settings</a></li>
          </ul>
        </div>
        <a href="#logout" className="sidebar-logout" onClick={handleLogout}>🚪 Logout</a>
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
          <p style={{color: '#64748b'}}>Manage your institution effectively!</p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>5</h3>
            <p>Number of Teachers 👨‍🏫</p>
          </div>
          <div className="stat-card">
            <h3>20</h3>
            <p>Number of Students 👩‍🎓</p>
          </div>
          <div className="stat-card">
            <h3>10</h3>
            <p>Number of Modules 📚</p>
          </div>
          <div className="stat-card">
            <h3>15</h3>
            <p>Total Courses 🎓</p>
          </div>
        </section>

        <div className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Add New Teacher</h3>
            </div>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
              Enter teacher email to send an invitation
            </p>
            <div className="chat-input-container">
              <input 
                type="email" 
                placeholder="teacher@email.com" 
                className="chat-input"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTeacher()}
              />
              <button className="btn-primary" onClick={handleAddTeacher}>Send Invite</button>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>AI Assistant</h3>
            </div>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '15px'}}>
              Ask me anything about your institution
            </p>
            <div className="chat-input-container">
              <input 
                type="text" 
                placeholder="Talk to me..." 
                className="chat-input"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              />
              <button className="btn-primary" onClick={handleSendChat}>Send</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}