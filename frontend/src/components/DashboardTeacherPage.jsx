import React, { useState } from 'react';
import '../styles/style.css';
import { logout } from '../auth';

export default function DashboardTeacherPage({ onNavigate }) {
  // Placeholder module data. Later this comes from the backend / Supabase.
  const [modules, setModules] = useState([
    {
      id: 1,
      name: 'Web Development',
      students: ['Anna Petrović', 'Marko Jovanović', 'Ivana Nikolić'],
      materials: ['Lecture 1 - Intro.pdf', 'Assignment 1.pdf'],
    },
    {
      id: 2,
      name: 'Databases',
      students: ['Stefan Đorđević', 'Jelena Ilić'],
      materials: ['SQL Basics.pdf'],
    },
    {
      id: 3,
      name: 'Algorithms',
      students: ['Nikola Marković', 'Milica Pavlović', 'Luka Stojanović'],
      materials: [],
    },
  ]);

  // Which module's student list is currently shown
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [chatMessage, setChatMessage] = useState('');
  const [userName, setUserName] = useState('Professor');

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || user.email?.split('@')[0] || 'Professor');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleFileUpload = (moduleId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // TODO: Upload to Supabase Storage
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId
          ? { ...m, materials: [...m.materials, file.name] }
          : m
      )
    );
    event.target.value = '';
    alert(`File "${file.name}" uploaded successfully!`);
  };

  const handleSendChat = () => {
    if (chatMessage) {
      console.log('Chat message:', chatMessage);
      alert(`AI Assistant: Let me help you with "${chatMessage}"`);
      setChatMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onNavigate('home');
  };

  const selectedModule = modules.find(m => m.id === selectedModuleId);
  const totalStudents = modules.reduce((sum, m) => sum + m.students.length, 0);
  const totalMaterials = modules.reduce((sum, m) => sum + m.materials.length, 0);


  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            <li><a href="#dash" className="sidebar-item active">📊 Dashboard</a></li>
            <li><a href="#modules" className="sidebar-item">📚 My Modules</a></li>
            <li><a href="#students" className="sidebar-item">👥 Students</a></li>
            <li><a href="#aichat" className="sidebar-item">🔮 AI Chat</a></li>
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
          <p style={{ color: '#64748b' }}>Manage your modules and share materials with your students.</p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>{modules.length}</h3>
            <p>Modules Teaching 📚</p>
          </div>
          <div className="stat-card">
            <h3>{totalStudents}</h3>
            <p>Total Students 👥</p>
          </div>
          <div className="stat-card">
            <h3>{totalMaterials}</h3>
            <p>Materials Uploaded 📁</p>
          </div>
        </section>

        {/* MY MODULES — each module has an upload area and a material list */}
        <h3 style={{ marginBottom: '15px' }}>My Modules</h3>
        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {modules.map(module => (
            <div className="dashboard-panel" key={module.id}>
              <div className="panel-header">
                <h3>{module.name}</h3>
                <span className="badge low">{module.students.length} students</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>
                Materials ({module.materials.length})
              </p>

              {module.materials.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
                  No materials yet.
                </p>
              )}

              {module.materials.map((file, i) => (
                <div className="task-item" key={i}>
                  <span style={{ fontSize: '0.85rem' }}>📄 {file}</span>
                </div>
              ))}

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <label className="btn-outline" style={{ cursor: 'pointer' }}>
                  + Upload material
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(module.id, e)}
                  />
                </label>
                <button
                  className="btn-primary"
                  onClick={() => setSelectedModuleId(module.id)}
                >
                  View students
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* STUDENTS OF SELECTED MODULE + AI CHAT */}
        <div className="dashboard-grid" style={{ marginTop: '25px' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Students — {selectedModule?.name}</h3>
              <span className="badge low">{selectedModule?.students.length} total</span>
            </div>
            {selectedModule?.students.map((student, i) => (
              <div className="task-item" key={i}>
                <span>{student}</span>
              </div>
            ))}
            {selectedModule?.students.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                No students enrolled yet.
              </p>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>AI Assistant</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
              Ask me to summarize a module, draft an announcement, or suggest material.
            </p>
            <div className="chat-input-container">
              <input type="text" 
              placeholder="Ask me anything..." 
              className="chat-input" 
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