import React, { useState, useEffect, useCallback } from 'react';
import '../styles/style.css';
import AiChatBox from './AiChatBox';
import { logout, fetchMe } from '../auth';
import {
  fetchDashboard, fetchTeachers, fetchStudents, fetchModules,
  createTeacher, createModule, setUserPassword, assignModules, isMock,
} from '../api';

const MENU = [
  { key: 'home',     label: 'Home',     icon: '🏠' },
  { key: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
  { key: 'students', label: 'Students', icon: '👩‍🎓' },
  { key: 'modules',  label: 'Modules',  icon: '📚' },
  { key: 'aichat',   label: 'AI Chat',  icon: '🤖' },
];

function formatDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleDateString();
}

export default function DashboardAdminPage({ onNavigate }) {
  const [section, setSection] = useState('home');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchMe().then(u => u && setUserName(u.name || u.email?.split('@')[0] || ''));
  }, []);

  function renderSection() {
    switch (section) {
      case 'home':     return <AdminHome userName={userName} />;
      case 'teachers': return <TeachersSection />;
      case 'students': return <StudentsSection />;
      case 'modules':  return <ModulesSection />;
      case 'aichat':   return <AiChatBox role="admin" userName={userName} />;
      default: return null;
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            {MENU.map(item => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`sidebar-item${section === item.key ? ' active' : ''}`}
                  onClick={() => setSection(item.key)}
                >
                  {item.icon} {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="sidebar-logout"
          onClick={() => { logout(); onNavigate('home'); }}
        >
          🚪 Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <input type="text" placeholder="Search anything..." className="search-bar" />
          <div className="header-actions">
            <span>🔔</span>
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

/* ---------------- Shared pieces ---------------- */

function useList(fetcher) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    setLoading(true);
    fetcher()
      .then(d => { setRows(d || []); setError(''); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => { reload(); }, [reload]);
  return { rows, loading, error, reload };
}

function TableState({ loading, error, count, emptyText }) {
  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>;
  if (error) return <p style={{ color: 'var(--danger-color)' }}>Could not load: {error}</p>;
  if (count === 0) return <p className="table-empty">{emptyText}</p>;
  return null;
}

function Notice({ show, children }) {
  if (!show) return null;
  return (
    <p style={{
      fontSize: '0.8rem', color: '#b45309', background: '#fffbeb',
      padding: '8px 12px', borderRadius: '6px', marginBottom: '15px',
    }}>{children}</p>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-white)', borderRadius: '12px', padding: '25px',
          width: '100%', maxWidth: '440px', maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div className="panel-header">
          <h3>{title}</h3>
          <button type="button" className="btn-outline" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const rowBtn = { padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' };

/* ---------------- Home ---------------- */

function AdminHome({ userName }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const teachers = useList(fetchTeachers);
  const students = useList(fetchStudents);
  const modules  = useList(fetchModules);

  useEffect(() => {
    fetchDashboard('admin')
      .then(data => {
        setStats({
          teachers: data.teachers_count ?? 0,
          students: data.students_count ?? 0,
          modules: data.modules_count ?? 0,
        });
        setFailed(false);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  // Fall back to counting the lists when the reports endpoint is unavailable.
  const shown = stats || {
    teachers: teachers.rows.length,
    students: students.rows.length,
    modules: modules.rows.length,
  };

  return (
    <>
      <div className="welcome-widget">
        <h2>Hello, {userName || '…'} 👋</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your institution effectively!</p>
      </div>

      <Notice show={failed}>
        Reports endpoint unavailable — showing counts from the lists below instead.
      </Notice>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard…</p>
      ) : (
        <section className="stats-grid">
          <div className="stat-card"><h3>{shown.teachers}</h3><p>Number of Teachers 👨‍🏫</p></div>
          <div className="stat-card"><h3>{shown.students}</h3><p>Number of Students 👩‍🎓</p></div>
          <div className="stat-card"><h3>{shown.modules}</h3><p>Number of Modules 📚</p></div>
        </section>
      )}
    </>
  );
}

/* ---------------- Password modal ---------------- */

function PasswordModal({ user, onClose }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setMsg('');
    if (pw.length < 6) return setMsg('⚠️ Password must be at least 6 characters.');
    if (pw !== confirm) return setMsg('⚠️ Passwords do not match.');
    setSaving(true);
    try {
      setMsg(`✅ ${await setUserPassword(user.id, pw)}`);
      setPw(''); setConfirm('');
    } catch (e) {
      setMsg(`⚠️ ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Change password — ${user.name}`} onClose={onClose}>
      <Notice show={isMock('setPassword')}>
        No admin password endpoint yet, so this won't save.
      </Notice>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
        {user.email}
      </p>
      <div className="input-group">
        <label style={{ fontSize: '0.85rem' }}>New password</label>
        <input type="password" className="input-field" style={{ fontSize: '1rem' }}
          value={pw} onChange={e => setPw(e.target.value)} />
      </div>
      <div className="input-group">
        <label style={{ fontSize: '0.85rem' }}>Confirm password</label>
        <input type="password" className="input-field" style={{ fontSize: '1rem' }}
          value={confirm} onChange={e => setConfirm(e.target.value)} />
      </div>
      <button className="btn-primary btn-block" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Update password'}
      </button>
      {msg && <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg}</p>}
    </Modal>
  );
}

/* ---------------- Assign modules modal ---------------- */

function AssignModulesModal({ student, modules, onClose }) {
  const initial = (student.module_study || '').split(',').map(s => s.trim()).filter(Boolean);
  const [selected, setSelected] = useState(initial);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function toggle(code) {
    setSelected(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  }

  async function save() {
    setMsg('');
    setSaving(true);
    try {
      setMsg(`✅ ${await assignModules(student.id, selected)}`);
    } catch (e) {
      setMsg(`⚠️ ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Assign modules — ${student.name}`} onClose={onClose}>
      <Notice show={isMock('assignModules')}>
        No enrollment endpoint yet, so this won't save.
      </Notice>

      {modules.length === 0 ? (
        <p className="table-empty">No modules exist yet. Create one first.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {modules.map(m => (
            <label key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem',
              padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px',
              cursor: 'pointer',
            }}>
              <input type="checkbox" checked={selected.includes(m.code)} onChange={() => toggle(m.code)} />
              <span><strong>{m.code}</strong> — {m.name}</span>
            </label>
          ))}
        </div>
      )}

      <button className="btn-primary btn-block" onClick={save} disabled={saving || modules.length === 0}>
        {saving ? 'Saving…' : 'Save assignments'}
      </button>
      {msg && <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg}</p>}
    </Modal>
  );
}

/* ---------------- Teachers ---------------- */

function TeachersSection() {
  const { rows, loading, error, reload } = useList(fetchTeachers);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [pwUser, setPwUser] = useState(null);

  async function invite() {
    setMsg('');
    if (!email) return setMsg('Please enter a teacher email.');
    setSending(true);
    try {
      setMsg(`✅ ${await createTeacher(email)}`);
      setEmail('');
      reload();
    } catch (e) {
      setMsg(`⚠️ ${e.message}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="dashboard-panel" style={{ marginBottom: '25px' }}>
        <div className="panel-header"><h3>Add New Teacher</h3></div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Enter teacher email to send an invitation
        </p>
        <div className="chat-input-container">
          <input type="email" placeholder="teacher@email.com" className="chat-input"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && invite()} />
          <button className="btn-primary" onClick={invite} disabled={sending}>
            {sending ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
        {msg && <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg}</p>}
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <h3>All Teachers ({rows.length})</h3>
          <button type="button" className="btn-outline" onClick={reload}>Refresh</button>
        </div>

        <Notice show={isMock('teachers')}>Sample data — waiting on the backend endpoint.</Notice>
        <TableState loading={loading} error={error} count={rows.length}
          emptyText="No teachers yet. Send an invite above to add one." />

        {!loading && !error && rows.length > 0 && (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(t => (
                <tr key={t.id}>
                  <td>{t.name || '—'}</td>
                  <td>{t.email || '—'}</td>
                  <td>{formatDate(t.date_created)}</td>
                  <td>
                    <button type="button" className="btn-outline" style={rowBtn}
                      onClick={() => setPwUser(t)}>Change password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pwUser && <PasswordModal user={pwUser} onClose={() => setPwUser(null)} />}
    </>
  );
}

/* ---------------- Students ---------------- */

function StudentsSection() {
  const { rows, loading, error, reload } = useList(fetchStudents);
  const { rows: modules } = useList(fetchModules);
  const [pwUser, setPwUser] = useState(null);
  const [assignUser, setAssignUser] = useState(null);

  return (
    <>
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3>All Students ({rows.length})</h3>
          <button type="button" className="btn-outline" onClick={reload}>Refresh</button>
        </div>

        <Notice show={isMock('students')}>Sample data — waiting on the backend endpoint.</Notice>
        <TableState loading={loading} error={error} count={rows.length}
          emptyText="No students enrolled yet." />

        {!loading && !error && rows.length > 0 && (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Modules</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id}>
                  <td>{s.name || '—'}</td>
                  <td>{s.email || '—'}</td>
                  <td>{s.module_study || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn-outline" style={rowBtn}
                      onClick={() => setPwUser(s)}>Change password</button>
                    <button type="button" className="btn-outline" style={rowBtn}
                      onClick={() => setAssignUser(s)}>Assign modules</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pwUser && <PasswordModal user={pwUser} onClose={() => setPwUser(null)} />}
      {assignUser && (
        <AssignModulesModal student={assignUser} modules={modules}
          onClose={() => setAssignUser(null)} />
      )}
    </>
  );
}

/* ---------------- Modules ---------------- */

function ModulesSection() {
  const { rows, loading, error, reload } = useList(fetchModules);
  const { rows: teachers } = useList(fetchTeachers);
  const [form, setForm] = useState({ name: '', code: '', description: '', teacher_id: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit() {
    setMsg('');
    if (!form.name.trim() || !form.code.trim()) {
      return setMsg('⚠️ Module name and code are both required.');
    }
    setSaving(true);
    try {
      setMsg(`✅ ${await createModule(form)}`);
      setForm({ name: '', code: '', description: '', teacher_id: '' });
      reload();
    } catch (e) {
      setMsg(`⚠️ ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="dashboard-panel" style={{ marginBottom: '25px' }}>
        <div className="panel-header"><h3>Create New Module</h3></div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
          Add a module and assign a teacher to it
        </p>

        <Notice show={isMock('teachers')}>
          Teacher list is sample data, so assignments won't save until the users endpoint is live.
        </Notice>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.85rem' }}>Module name</label>
            <input type="text" className="input-field" style={{ fontSize: '1rem' }}
              placeholder="Introduction to Databases"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.85rem' }}>Code</label>
            <input type="text" className="input-field" style={{ fontSize: '1rem' }}
              placeholder="CS201"
              value={form.code} onChange={e => set('code', e.target.value)} />
          </div>
        </div>

        <div className="input-group" style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '0.85rem' }}>Description</label>
          <input type="text" className="input-field" style={{ fontSize: '1rem' }}
            placeholder="What this module covers"
            value={form.description} onChange={e => set('description', e.target.value)} />
        </div>

        <div className="input-group">
          <label style={{ fontSize: '0.85rem' }}>Assign teacher</label>
          <select className="input-field" style={{ fontSize: '1rem' }}
            value={form.teacher_id} onChange={e => set('teacher_id', e.target.value)}>
            <option value="">Unassigned</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name} — {t.email}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? 'Creating…' : 'Create module'}
        </button>
        {msg && <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{msg}</p>}
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <h3>All Modules ({rows.length})</h3>
          <button type="button" className="btn-outline" onClick={reload}>Refresh</button>
        </div>

        <Notice show={isMock('modules')}>Sample data — waiting on the backend endpoint.</Notice>
        <TableState loading={loading} error={error} count={rows.length}
          emptyText="No modules created yet. Use the form above." />

        {!loading && !error && rows.length > 0 && (
          <table className="data-table">
            <thead><tr><th>Module</th><th>Code</th><th>Teacher</th><th>Description</th></tr></thead>
            <tbody>
              {rows.map(m => (
                <tr key={m.id}>
                  <td>{m.name || '—'}</td>
                  <td>{m.code || '—'}</td>
                  <td>{m.teacher_name || 'Unassigned'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.description || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}