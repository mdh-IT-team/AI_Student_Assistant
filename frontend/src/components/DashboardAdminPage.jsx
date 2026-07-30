import React, { useState, useEffect } from 'react';
import '../styles/style.css';
import AiChatBox from './AiChatBox';
import { logout, getToken, fetchMe } from '../auth';
import { fetchDashboard } from '../api';

export default function DashboardAdminPage({ onNavigate }) {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [userName, setUserName] = useState('Admin');
  const [stats, setStats] = useState({ teachers: 0, students: 0, modules: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => {
    fetchMe().then(user => {
      if (user) setUserName(user.name || user.email?.split('@')[0] || 'Admin');
    });

    fetchDashboard('admin')
      .then(data => {
        setStats({
          teachers: data.teachers_count ?? 0,
          students: data.students_count ?? 0,
          modules: data.modules_count ?? 0,
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleAddTeacher() {
    setInviteMsg('');
    if (!teacherEmail) {
      setInviteMsg('Please enter a teacher email.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/admin/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ email: teacherEmail }),
      });
      const data = await res.json();
      if (data.status === 'Success') {
        setInviteMsg(`✅ ${data.message}`);
        setTeacherEmail('');
      } else {
        setInviteMsg(`⚠️ ${data.message}`);
      }
    } catch {
      setInviteMsg('Could not reach the server. Is the backend running?');
    }
  }

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
          <p style={{ color: '#64748b' }}>Manage your institution effectively!</p>
        </div>

        {loading && <p>Loading dashboard…</p>}
        {error && <p style={{ color: '#ef4444' }}>Could not load dashboard: {error}</p>}

        {!loading && !error && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <h3>{stats.teachers}</h3>
                <p>Number of Teachers 👨‍🏫</p>
              </div>
              <div className="stat-card">
                <h3>{stats.students}</h3>
                <p>Number of Students 👩‍🎓</p>
              </div>
              <div className="stat-card">
                <h3>{stats.modules}</h3>
                <p>Number of Modules 📚</p>
              </div>
            </section>

            <div className="dashboard-grid">
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h3>Add New Teacher</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
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
                {inviteMsg && (
                  <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#64748b' }}>{inviteMsg}</p>
                )}
              </div>
            </div>

            <AiChatBox role="admin" userName={userName} />
          </>
        )}
      </main>
    </div>
  );
}