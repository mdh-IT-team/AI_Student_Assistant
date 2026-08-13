import React, { useState, useEffect } from 'react';
import '../styles/style.css';
import { logout, fetchMe } from '../auth';
import { fetchDashboard } from '../api';
import { SidebarIcons } from './SidebarIcons';
import FileManager from './FileManager';

const TEACHER_MENU = [
  { key: 'home', label: 'Home', icon: SidebarIcons.home },
  { key: 'modules', label: 'Modules', icon: SidebarIcons.modules },
  { key: 'students', label: 'Students', icon: SidebarIcons.students },
  { key: 'files', label: 'Files', icon: SidebarIcons.files },
  { key: 'aichat', label: 'AI Chat', icon: SidebarIcons.aichat },
];

export default function DashboardTeacherPage({ onNavigate }) {
  const [modules, setModules] = useState([]);
  const [databaseStudents, setDatabaseStudents] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [userName, setUserName] = useState('Professor');
  const [fullName,setFullName]=useState('');
  const [profileImage,setProfileImage]=useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordMessage, setPasswordMessage] = useState('');
const [changingPassword, setChangingPassword] = useState(false);

  // ADDED: controls which sidebar section is visible
  const [activeSection, setActiveSection] = useState('home');
  const [studentsViewMode, setStudentsViewMode] = useState('all');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ADDED: student assignment form
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  const [assignModuleName, setAssignModuleName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editModuleName, setEditModuleName] = useState('');

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage('');
    }, 4000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    fetchMe().then(user => {
      if (user){ const n=user.name||user.email?.split('@')[0]||'Professor'; setUserName(n); setFullName(n); setProfileImage(user.avatar_url||''); }
    });

    fetchDashboard('teacher')
      .then(data => {
        const studentsFromDatabase = Array.isArray(data.students)
          ? data.students
          : [];

        const modulesFromDatabase = Array.isArray(data.modules)
          ? data.modules
          : [];

        const built = modulesFromDatabase.map((module, index) => {
          const moduleIdentifiers = [module.name, module.code]
            .filter(Boolean)
            .map(value => String(value).trim().toUpperCase());

          return {
            id: module.id || index + 1,
            name: module.name || module.code || `Module ${index + 1}`,
            code: module.code || '',
            description: module.description || '',
            teacher_id: module.teacher_id || null,
            students: studentsFromDatabase.filter(student => {
              const enrolledModules = Array.isArray(student.enrolled_modules)
                ? student.enrolled_modules
                : [];

              // enrolled_modules is an array of objects, not strings:
              // { module_name, module_code, semester }
              return enrolledModules.some(enrolledModule => {
                const candidates = typeof enrolledModule === 'string'
                  ? [enrolledModule]
                  : [enrolledModule?.module_name, enrolledModule?.module_code];
                return candidates
                  .filter(Boolean)
                  .some(value =>
                    moduleIdentifiers.includes(String(value).trim().toUpperCase())
                  );
              });
            }),
            materials: Array.isArray(module.materials)
              ? module.materials
              : [],
          };
        });

        setDatabaseStudents(studentsFromDatabase);
        setModules(built);
        setSelectedModule(built[0]?.name || null);
        setAssignModuleName(built[0]?.name || '');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleFileUpload(moduleId, event) {
    const file = event.target.files[0];
    if (!file) return;

    // Existing behaviour kept unchanged.
    // TODO (backend): upload the file to Supabase Storage here.
    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, materials: [...m.materials, file.name] } : m
      )
    );

    setSuccessMessage(`${file.name} added to the selected module.`);
    event.target.value = '';
  }

  function handleSendChat() {
    if (!chatMessage) return;
    alert(`AI Assistant: Let me help you with "${chatMessage}"`);
    setChatMessage('');
  }

async function handleChangePassword(event) {
  event.preventDefault();

  setPasswordMessage('');
  setError('');

  if (!newPassword || !confirmPassword) {
    setError('Please enter and confirm your new password.');
    return;
  }

  if (newPassword.length < 6) {
    setError('Password must contain at least 6 characters.');
    return;
  }

  if (newPassword !== confirmPassword) {
    setError('The passwords do not match.');
    return;
  }

  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');

  if (!token) {
    setError('Your session has expired. Please log in again.');
    return;
  }

  setChangingPassword(true);

  try {
    const response = await fetch(
      'http://localhost:8000/auth/change-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password: newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status === 'Error') {
      throw new Error(
        data.message || 'Password could not be changed.'
      );
    }

    setPasswordMessage(
      data.message || 'Password changed successfully!'
    );

    setNewPassword('');
    setConfirmPassword('');
  } catch (err) {
    setError(
      err.message || 'Password could not be changed.'
    );
  } finally {
    setChangingPassword(false);
  }
}



  // ADDED: local assignment UI only. Replace this with your team's
  // backend endpoint once the exact route and request body are confirmed.
  function handleAssignStudent(event) {
    event.preventDefault();
    setError('');

    if (!selectedStudentEmail || !assignModuleName) {
      setError('Please select both a student and a module.');
      return;
    }

    const selectedStudent = allStudents.find(
      student => student.email === selectedStudentEmail
    );

    if (!selectedStudent) {
      setError('Selected student was not found.');
      return;
    }

    const targetModule = modules.find(
      module => module.name === assignModuleName
    );

    if (!targetModule) {
      setError('Selected module was not found.');
      return;
    }

    const alreadyAssigned = targetModule.students.some(
      student => student.email === selectedStudent.email
    );

    if (alreadyAssigned) {
      setError(
        `${selectedStudent.name || selectedStudent.email} is already assigned to ${assignModuleName}.`
      );
      return;
    }

    setModules(prev =>
      prev.map(module =>
        module.name === assignModuleName
          ? {
              ...module,
              students: [...module.students, selectedStudent],
            }
          : module
      )
    );

    setSelectedModule(assignModuleName);
    setSuccessMessage(
      `${selectedStudent.name || selectedStudent.email} assigned to ${assignModuleName} successfully.`
    );
    setSelectedStudentEmail('');
  }

  function startEditAssignment(student, moduleName) {
    setEditingAssignment({
      studentEmail: student.email,
      studentName: student.name || student.email,
      originalModuleName: moduleName,
    });
    setEditModuleName(moduleName);
    setError('');
    setSuccessMessage('');
  }

  function cancelEditAssignment() {
    setEditingAssignment(null);
    setEditModuleName('');
  }

  function handleEditAssignment(event) {
    event.preventDefault();
    setError('');

    if (!editingAssignment || !editModuleName) {
      setError('Please select the new module.');
      return;
    }

    if (editModuleName === editingAssignment.originalModuleName) {
      setError('Please select a different module.');
      return;
    }

    const student = allStudents.find(
      item => item.email === editingAssignment.studentEmail
    );

    if (!student) {
      setError('Student was not found.');
      return;
    }

    const destinationModule = modules.find(
      module => module.name === editModuleName
    );

    if (!destinationModule) {
      setError('Selected module was not found.');
      return;
    }

    const alreadyInDestination = destinationModule.students.some(
      item => item.email === editingAssignment.studentEmail
    );

    if (alreadyInDestination) {
      setError(
        `${editingAssignment.studentName} is already assigned to ${editModuleName}.`
      );
      return;
    }

    setModules(prev =>
      prev.map(module => {
        if (module.name === editingAssignment.originalModuleName) {
          return {
            ...module,
            students: module.students.filter(
              item => item.email !== editingAssignment.studentEmail
            ),
          };
        }

        if (module.name === editModuleName) {
          return {
            ...module,
            students: [...module.students, student],
          };
        }

        return module;
      })
    );

    setSelectedModule(editModuleName);
    setSuccessMessage(
      `${editingAssignment.studentName} moved to ${editModuleName} successfully.`
    );
    cancelEditAssignment();
  }

  function handleDeleteAssignment(student, moduleName) {
    const confirmed = window.confirm(
      `Remove ${student.name || student.email} from ${moduleName}?`
    );

    if (!confirmed) return;

    setModules(prev =>
      prev.map(module =>
        module.name === moduleName
          ? {
              ...module,
              students: module.students.filter(
                item => item.email !== student.email
              ),
            }
          : module
      )
    );

    setError('');
    setSuccessMessage(
      `${student.name || student.email} removed from ${moduleName} successfully.`
    );

    if (
      editingAssignment?.studentEmail === student.email &&
      editingAssignment?.originalModuleName === moduleName
    ) {
      cancelEditAssignment();
    }
  }


  const current = modules.find(m => m.name === selectedModule);

  const allStudents = Array.from(
    new Map(
      databaseStudents.map(student => [student.email || student.id, student])
    ).values()
  );

  const selectedAssignmentModule = modules.find(
    module => module.name === assignModuleName
  );

  const eligibleStudents = allStudents.filter(student =>
    !selectedAssignmentModule?.students.some(
      assignedStudent => assignedStudent.email === student.email
    )
  );

  const totalStudents = allStudents.length;

  const totalMaterials = modules.reduce(
    (sum, m) => sum + m.materials.length,
    0
  );

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo">AI Student Assistant</div>

          <ul className="sidebar-menu">
            {TEACHER_MENU.map(item => (
              <li key={item.key}>
                <button
                  type="button"
                  className={`sidebar-item${activeSection === item.key ? ' active' : ''}`}
                  onClick={() => {
                    if (item.key === 'students') {
                      setStudentsViewMode('all');
                    }

                    setProfileMenuOpen(false);
                    setActiveSection(item.key);
                  }}
                >
                  <span className="sidebar-icon-wrap">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          title="Logout"
        >
          <span className="sidebar-icon-wrap">{SidebarIcons.logout}</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <input
            type="text"
            placeholder="Search anything..."
            className="search-bar"
          />

          <div className="header-actions">
            <div
              className="profile-widget"
              style={{ position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => setProfileMenuOpen(open => !open)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'inherit',
                  font: 'inherit',
                }}
              >
                <div
                  className="avatar"
                  style={{
                    backgroundImage: profileImage
                      ? `url(${profileImage})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <span>Hi, {userName || '…'} ▾</span>
              </button>

              {profileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: 0,
                    minWidth: '180px',
                    background: 'var(--bg-white, #ffffff)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)',
                    padding: '8px',
                    zIndex: 1000,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setError('');
                      setPasswordMessage('');
                      setActiveSection('settings');
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      font: 'inherit',
                    }}
                  >
                    ⚙️ Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                      onNavigate('home');
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'var(--danger-color, #dc2626)',
                      font: 'inherit',
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {loading && <p>Loading your dashboard…</p>}

        {error && (
          <p style={{ color: '#ef4444', marginBottom: '15px' }}>
            {error}
          </p>
        )}

        {successMessage && (
          <div
            style={{
              color: '#166534',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <span>✅ {successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage('')}
              aria-label="Close success message"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {!loading && !error && activeSection === 'files' && (
          <FileManager userEmail={fullName || userName} />
        )}

        {!loading && !error && activeSection === 'home' && (
          <>
            <div
              className="welcome-widget"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div>
                <h2>Hello, {userName}! 👋</h2>
                <p style={{ color: '#64748b' }}>
                  Manage your modules and share materials with your students.
                </p>
              </div>

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

            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>Reports</h3>
              </div>

              <div className="task-item">
                <span>Total modules assigned</span>
                <strong>{modules.length}</strong>
              </div>

              <div className="task-item">
                <span>Total students in your modules</span>
                <strong>{totalStudents}</strong>
              </div>
            </div>

          </>
        )}

        {!loading && activeSection === 'settings' && (
          <>
            <div className="welcome-widget">
              <h2>Settings ⚙️</h2>
              <p style={{ color: '#64748b' }}>
                Manage your account information and security settings.
              </p>
            </div>

            <div className="dashboard-panel" style={{maxWidth:'700px',marginBottom:'20px'}}>
              <div className="panel-header">
                <h3>👤 Account</h3>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:'20px',marginBottom:'18px'}}>
                <div className="avatar" style={{width:'70px',height:'70px',backgroundImage: profileImage?`url(${profileImage})`:undefined,backgroundSize:'cover'}}></div>
                <div>
                  <label className="btn-outline" style={{cursor:'pointer'}}>
                    Change Profile Picture
                    <input type="file" accept="image/*" style={{display:'none'}}
                      onChange={e=>{
                        const f=e.target.files?.[0];
                        if(f){
                          setProfileImage(URL.createObjectURL(f));
                          setSuccessMessage('Profile picture updated locally.');
                        }
                      }}/>
                  </label>
                </div>
              </div>

              <label>Full Name</label>
              <input
                className="search-bar"
                style={{width:'100%',margin:'8px 0 15px'}}
                value={fullName}
                onChange={e=>setFullName(e.target.value)}
              />

              <label>Email Address</label>
              <input
                className="search-bar"
                style={{width:'100%',margin:'8px 0 15px',background:'#f8fafc'}}
                value={fetchMe ? '' : ''}
                placeholder={userName.includes('@')?userName:'Email from account'}
                readOnly
              />

              <label>Teacher ID</label>
              <input
                className="search-bar"
                style={{width:'100%',margin:'8px 0 15px',background:'#f8fafc'}}
                value="Assigned by Administrator"
                readOnly
              />

              <button
                type="button"
                className="btn-primary"
                onClick={()=>{
                  setUserName(fullName);
                  setSuccessMessage('Profile updated locally.');
                }}>
                Save Changes
              </button>
            </div>

            <div className="dashboard-panel" style={{ maxWidth: '600px' }}>
              <div className="panel-header">
                <h3>🔒 Security</h3>
              </div>

              <div style={{marginBottom:'15px',color:'#64748b',fontSize:'0.9rem'}}>
                <div><strong>Last Login:</strong> Current session</div>
                <div><strong>Active Session:</strong> This browser</div>
              </div>

              <div className="panel-header">
                <h3>Change Password 🔐</h3>

              </div>

              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  marginBottom: '15px',
                }}
              >
                Update the password for your teacher account.
              </p>

              {passwordMessage && (
                <p
                  style={{
                    color: '#16a34a',
                    marginBottom: '12px',
                  }}
                >
                  ✅ {passwordMessage}
                </p>
              )}

              <form onSubmit={handleChangePassword}>
                <input
                  type="password"
                  className="search-bar"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={event => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    marginBottom: '12px',
                  }}
                />

                <input
                  type="password"
                  className="search-bar"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    marginBottom: '15px',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={changingPassword}
                  >
                    {changingPassword
                      ? 'Changing Password...'
                      : 'Change Password'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setNewPassword('');
                      setConfirmPassword('');
                      setPasswordMessage('');
                      setError('');
                      setActiveSection('home');
                    }}
                  >
                    ← Back to Homepage
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {!loading && !error && activeSection === 'modules' && (
          <>
            <div className="welcome-widget">
              <h2>My Modules 📚</h2>
              <p style={{ color: '#64748b' }}>
                See all modules assigned to you and upload module materials.
              </p>
            </div>

            {modules.length === 0 && (
              <p style={{ color: '#94a3b8' }}>
                No modules assigned to you yet.
              </p>
            )}

            <div
              className="dashboard-grid"
              style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
            >
              {modules.map(module => (
                <div className="dashboard-panel" key={module.id}>
                  <div className="panel-header">
                    <h3>{module.name}</h3>
                    <span className="badge low">
                      {module.students.length} students
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      marginBottom: '10px',
                    }}
                  >
                    Materials ({module.materials.length})
                  </p>

                  {module.materials.length === 0 && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        marginBottom: '10px',
                      }}
                    >
                      No materials yet.
                    </p>
                  )}

                  {module.materials.map((file, i) => (
                    <div className="task-item" key={i}>
                      <span style={{ fontSize: '0.85rem' }}>
                        📄 {file}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: '15px',
                      display: 'flex',
                      gap: '10px',
                    }}
                  >
                    <label
                      className="btn-outline"
                      style={{ cursor: 'pointer' }}
                    >
                      + Upload material
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={e => handleFileUpload(module.id, e)}
                      />
                    </label>

                    <button
                      className="btn-primary"
                      onClick={() => {
                        setSelectedModule(module.name);
                        setStudentsViewMode('module');
                        setActiveSection('students');
                      }}
                    >
                      View students
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && activeSection === 'students' && (
          <>
            <div
              className="welcome-widget"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div>
                <h2>
                  {studentsViewMode === 'module'
                    ? `Students — ${current?.name || 'Module'} 👥`
                    : 'Students 👥'}
                </h2>
                <p style={{ color: '#64748b' }}>
                  {studentsViewMode === 'module'
                    ? 'Showing only the students assigned to this module.'
                    : 'See all students and assign a student to one of your modules.'}
                </p>
              </div>

              {studentsViewMode === 'module' && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setStudentsViewMode('all')}
                >
                  ← View All Students
                </button>
              )}
            </div>

            {studentsViewMode === 'all' && (
            <div className="dashboard-grid">
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h3>All Students</h3>
                  <span className="badge low">
                    {allStudents.length} total
                  </span>
                </div>

                {allStudents.map((student, index) => (
                  <div className="task-item" key={student.email || index}>
                    <div>
                      <span>{student.name || student.email}</span>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                        }}
                      >
                        {student.email}
                      </div>
                    </div>
                  </div>
                ))}

                {allStudents.length === 0 && (
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                    }}
                  >
                    No students found.
                  </p>
                )}
              </div>

              <div className="dashboard-panel">
                <div className="panel-header">
                  <h3>Assign Student to Module</h3>
                </div>

                <form onSubmit={handleAssignStudent}>
                  <select
                    className="search-bar"
                    style={{ width: '100%', marginBottom: '12px' }}
                    value={selectedStudentEmail}
                    onChange={e => setSelectedStudentEmail(e.target.value)}
                  >
                    <option value="">Select student</option>
                    {eligibleStudents.map(student => (
                      <option key={student.email} value={student.email}>
                        {student.name || student.email}
                      </option>
                    ))}
                  </select>

                  {assignModuleName && eligibleStudents.length === 0 && (
                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '0.85rem',
                        marginTop: '-4px',
                        marginBottom: '12px',
                      }}
                    >
                      Every student is already assigned to this module.
                    </p>
                  )}

                  <select
                    className="search-bar"
                    style={{ width: '100%', marginBottom: '12px' }}
                    value={assignModuleName}
                    onChange={e => setAssignModuleName(e.target.value)}
                  >
                    <option value="">Select module</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.name}>
                        {module.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={
                      !selectedStudentEmail ||
                      !assignModuleName ||
                      eligibleStudents.length === 0
                    }
                  >
                    Assign Student
                  </button>
                </form>
              </div>
            </div>
            )}

            <div
              className="dashboard-panel"
              style={{ marginTop: studentsViewMode === 'module' ? '0' : '25px' }}
            >
              <div className="panel-header">
                <h3>
                  {studentsViewMode === 'module'
                    ? `Assigned Students — ${current?.name || '—'}`
                    : `Students — ${current?.name || '—'}`}
                </h3>
                <span className="badge low">
                  {current?.students.length || 0} total
                </span>
              </div>

              <select
                className="search-bar"
                style={{ width: '100%', marginBottom: '15px' }}
                value={selectedModule || ''}
                onChange={e => setSelectedModule(e.target.value)}
              >
                {modules.map(module => (
                  <option key={module.id} value={module.name}>
                    {module.name}
                  </option>
                ))}
              </select>

              {current?.students.map((student, index) => (
                <div
                  className="task-item"
                  key={student.email || index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span>{student.name || student.email}</span>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                      }}
                    >
                      {student.email}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() =>
                        startEditAssignment(student, current.name)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() =>
                        handleDeleteAssignment(student, current.name)
                      }
                      style={{
                        color: '#dc2626',
                        borderColor: '#fecaca',
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}

              {editingAssignment && (
                <div
                  style={{
                    marginTop: '18px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                >
                  <h4 style={{ marginBottom: '12px' }}>
                    Edit assignment — {editingAssignment.studentName}
                  </h4>

                  <form onSubmit={handleEditAssignment}>
                    <select
                      className="search-bar"
                      value={editModuleName}
                      onChange={event =>
                        setEditModuleName(event.target.value)
                      }
                      style={{
                        width: '100%',
                        marginBottom: '12px',
                      }}
                    >
                      <option value="">Select new module</option>
                      {modules.map(module => (
                        <option
                          key={module.id}
                          value={module.name}
                          disabled={
                            module.name ===
                            editingAssignment.originalModuleName
                          }
                        >
                          {module.name}
                        </option>
                      ))}
                    </select>

                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button type="submit" className="btn-primary">
                        Save Changes
                      </button>

                      <button
                        type="button"
                        className="btn-outline"
                        onClick={cancelEditAssignment}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {(!current || current.students.length === 0) && (
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                  }}
                >
                  No students enrolled yet.
                </p>
              )}
            </div>
          </>
        )}

        {!loading && !error && activeSection === 'aichat' && (
          <>
            <div className="welcome-widget">
              <h2>AI Chat 🔮</h2>
              <p style={{ color: '#64748b' }}>
                Ask the AI assistant about teaching, modules or students.
              </p>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <h3>AI Assistant</h3>
              </div>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  marginBottom: '15px',
                }}
              >
                Ask me to summarize a module, draft an announcement,
                or suggest material.
              </p>

              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="chat-input"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyPress={e =>
                    e.key === 'Enter' && handleSendChat()
                  }
                />

                <button
                  className="btn-primary"
                  onClick={handleSendChat}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}