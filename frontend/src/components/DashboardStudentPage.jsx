import React, { useState, useEffect, useCallback } from 'react';
import '../styles/style.css';
import AiChatBox from './AiChatBox';
import { SidebarIcons, initials } from './SidebarIcons';
import { logout, fetchMe } from '../auth';
import { fetchDashboard } from '../api';

const MENU = [
  { key: 'home',    label: 'Home',     icon: SidebarIcons.home },
  { key: 'modules', label: 'Modules',  icon: SidebarIcons.modules },
  { key: 'aichat',  label: 'AI Chat',  icon: SidebarIcons.aichat },
];

// The backend may return modules as an array of objects or as a
// comma-separated string, so normalise both into a plain list of names.
function toModuleList(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map(m => (typeof m === 'string' ? m : (m.code || m.name)))
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw.split(',').map(m => m.trim()).filter(Boolean);
  }
  return [];
}

export default function DashboardStudentPage({ onNavigate }) {
  const [section, setSection] = useState('home');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [modules, setModules] = useState([]);
  const [semester, setSemester] = useState('—');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchDashboard('student')
      .then(data => {
        setModules(toModuleList(data.studying_modules));
        setSemester(data.semester || 'Not specified');
        setError('');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMe().then(u => {
      if (!u) return;
      setUserName(u.name || u.email?.split('@')[0] || '');
      setUserEmail(u.email || '');
    });
    load();
  }, [load]);

  function renderSection() {
    switch (section) {
      case 'home':
        return (
          <StudentHome
            userName={userName} modules={modules} semester={semester}
            loading={loading} error={error}
          />
        );
      case 'modules':
        return (
          <ModulesSection
            modules={modules} loading={loading} error={error}
            userName={userName} onReload={load}
          />
        );
      case 'aichat':
        return <AiChatBox role="student" userName={userName} />;
      default:
        return null;
    }
  }

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
                <button
                  type="button"
                  className={`sidebar-item${section === item.key ? ' active' : ''}`}
                  onClick={() => setSection(item.key)}
                  title={item.label}
                >
                  <span className="sidebar-icon-wrap">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => { logout(); onNavigate('home'); }}
            title="Logout"
          >
            <span className="sidebar-icon-wrap">{SidebarIcons.logout}</span>
            <span className="sidebar-label">Logout</span>
          </button>

          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar">{initials(userName || userEmail)}</div>
            <div className="sidebar-profile-text">
              <div className="sidebar-profile-name">{userName || 'Student'}</div>
              <div className="sidebar-profile-email">{userEmail}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <input type="text" placeholder="Search anything..." className="search-bar" />
          <div className="header-actions">
            <div className="profile-widget">
              <div className="avatar"></div>
              <span>Hi, {userName || '…'} ▾</span>
            </div>
          </div>
        </header>
        {renderSection()}
      </main>
    </div>
  );
}

/* ---------------- Home ---------------- */

function StudentHome({ userName, modules, semester, loading, error }) {
  return (
    <>
      <div className="welcome-widget">
        <h2>Hello, {userName || '…'}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Let's make today productive!</p>
      </div>

      {loading && <p>Loading your dashboard…</p>}
      {error && <p style={{ color: 'var(--danger-color)' }}>Could not load dashboard: {error}</p>}

      {!loading && !error && (
        <section className="stats-grid">
          <div className="stat-card">
            <h3>{modules.length}</h3>
            <p>Modules Enrolled </p>
          </div>
          <div className="stat-card">
            <h3>{semester}</h3>
            <p>Current Semester </p>
          </div>
        </section>
      )}
    </>
  );
}

/* ---------------- Modules ---------------- */

function ModulesSection({ modules, loading, error, userName, onReload }) {
  return (
    <>
      <div className="dashboard-panel" style={{ marginBottom: '25px' }}>
        <div className="panel-header">
          <h3>My Modules ({modules.length})</h3>
          <button type="button" className="btn-outline" onClick={onReload}>Refresh</button>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
        {error && <p style={{ color: 'var(--danger-color)' }}>Could not load: {error}</p>}

        {!loading && !error && modules.length === 0 && (
          <p className="table-empty">You are not enrolled in any modules yet.</p>
        )}

        {!loading && !error && modules.length > 0 && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Open a module to ask about its materials.
          </p>
        )}
      </div>

      {!loading && !error && modules.map(m => (
        <ModuleCard key={m} moduleName={m} userName={userName} />
      ))}
    </>
  );
}

function ModuleCard({ moduleName, userName }) {
  const [open, setOpen] = useState(false);
  // Mount the chat on first open and keep it mounted, so collapsing
  // the card doesn't wipe the conversation.
  const [mounted, setMounted] = useState(false);

  function toggle() {
    if (!mounted) setMounted(true);
    setOpen(o => !o);
  }

  return (
    <div className="dashboard-panel" style={{ marginBottom: '15px' }}>
      <div className="panel-header" style={{ marginBottom: open ? '15px' : 0 }}>
        <h3 style={{ fontSize: '1rem' }}>📖 {moduleName}</h3>
        <button
          type="button"
          className="btn-outline"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            ...(open ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}),
          }}
          onClick={toggle}
        >
          {open ? 'Hide chat' : 'Chat about materials'}
        </button>
      </div>

      {mounted && (
        <div style={{ display: open ? 'block' : 'none' }}>
          <AiChatBox role="student" userName={userName} moduleName={moduleName} embedded />
        </div>
      )}
    </div>
  );
}