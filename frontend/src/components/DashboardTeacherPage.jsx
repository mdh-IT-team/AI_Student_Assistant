import React, { useState, useEffect } from 'react';
import '../styles/style.css';
import { logout, fetchMe } from '../auth';
import { fetchDashboard } from '../api';
import AiChatBox from './AiChatBox';
import { SidebarIcons, initials } from './SidebarIcons';

const MENU = [
  { key: 'dash',     label: 'Dashboard',  icon: SidebarIcons.home,     active: true },
  { key: 'modules',  label: 'My Modules', icon: SidebarIcons.modules },
  { key: 'students', label: 'Students',   icon: SidebarIcons.students },
  { key: 'aichat',   label: 'AI Chat',    icon: SidebarIcons.aichat },
  { key: 'settings', label: 'Settings',   icon: SidebarIcons.settings },
];

export default function DashboardTeacherPage({ onNavigate }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [userName, setUserName] = useState('Professor');
  const [userEmail, setUserEmail] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMe().then(user => {
      if (user) {
        setUserName(user.name || user.email?.split('@')[0] || 'Professor');
        setUserEmail(user.email || '');
      }
    });

    fetchDashboard('teacher')
      .then(data => {
        const names = (data.teaching_modules || '')
          .split(',')
          .map(m => m.trim())
          .filter(Boolean);

        const built = names.map((name, i) => ({
          id: i + 1,
          name,
          students: (data.students || []).filter(s =>
            (s.enrolled_modules || []).includes(name)
          ),
          materials: [],
        }));

        setModules(built);
        setSelectedModule(built[0]?.name || null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleFileUpload(moduleId, event) {
    const file = event.target.files[0];
    if (!file) return;
    // TODO (backend): upload the file to Supabase Storage here.
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, materials: [...m.materials, file.name] } : m
      )
    );
    event.target.value = '';
  }


  const current = modules.find(m => m.name === selectedModule);
  const totalStudents = new Set(
    modules.flatMap(m => m.students.map(s => s.email))
  ).size;
  const totalMaterials = modules.reduce((sum, m) => sum + m.materials.length, 0);

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
        <div>
          <div className="sidebar-top-row">
            {!collapsed && <div className="logo">🤖 AI Student Assistant</div>}
            <button
              type="button"
              className={`sidebar-toggle${collapsed ? ' collapsed-icon' : ''}`}
              onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {SidebarIcons.collapse}
            </button>
          </div>

          <ul className="sidebar-menu">
            {MENU.map(item => (
              <li key={item.key}>
                <a
                  href={`#${item.key}`}
                  className={`sidebar-item${item.active ? ' active' : ''}`}
                  title={item.label}
                >
                  <span className="sidebar-icon-wrap">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <a
            href="#logout"
            className="sidebar-logout"
            onClick={() => { logout(); onNavigate('home'); }}
            title="Logout"
          >
            <span className="sidebar-icon-wrap">{SidebarIcons.logout}</span>
            <span className="sidebar-label">Logout</span>
          </a>

          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar">{initials(userName || userEmail)}</div>
            <div className="sidebar-profile-text">
              <div className="sidebar-profile-name">{userName}</div>
              <div className="sidebar-profile-email">{userEmail}</div>
            </div>
          </div>
        </div>
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

        {loading && <p>Loading your dashboard…</p>}
        {error && <p style={{ color: '#ef4444' }}>Could not load dashboard: {error}</p>}

        {!loading && !error && (
          <>
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

            <h3 style={{ marginBottom: '15px' }}>My Modules</h3>

            {modules.length === 0 && (
              <p style={{ color: '#94a3b8' }}>No modules assigned to you yet.</p>
            )}

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
                    <button className="btn-primary" onClick={() => setSelectedModule(module.name)}>
                      View students
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-grid" style={{ marginTop: '25px' }}>
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h3>Students — {current?.name || '—'}</h3>
                  <span className="badge low">{current?.students.length || 0} total</span>
                </div>
                {current?.students.map((s, i) => (
                  <div className="task-item" key={i}>
                    <div>
                      <span>{s.name || s.email}</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.email}</div>
                    </div>
                  </div>
                ))}
                {(!current || current.students.length === 0) && (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No students enrolled yet.</p>
                )}
              </div>
            </div>
            <AiChatBox role="teacher" userName={userName} />

          </>
        )}
      </main>
    </div>
  );
}
