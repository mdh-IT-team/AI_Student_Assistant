import { getToken } from './auth';

const BASE = 'http://localhost:8000';

// Flip to false as each backend endpoint goes live.
export const USE_MOCK = {
  teachers: true,
  students: true,
  modules: true,
  setPassword: true,
  assignModules: true,
};

async function request(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const json = await res.json();
  if (json.status !== 'Success') throw new Error(json.message || 'Request failed');
  return json;
}

function mock(data, ms = 300) {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}

/* ---------- Sample data (delete once endpoints exist) ---------- */

const MOCK_TEACHERS = [
  { id: 't1', name: 'Ana Kovač',    email: 'ana.kovac@school.edu',  date_created: '2026-02-11' },
  { id: 't2', name: 'David Miller', email: 'd.miller@school.edu',   date_created: '2026-03-04' },
  { id: 't3', name: 'Sara Novak',   email: 'sara.novak@school.edu', date_created: '2026-05-19' },
];

const MOCK_STUDENTS = [
  { id: 's1', name: 'Luka Perić',   email: 'luka.peric@school.edu',  date_created: '2026-01-15', module_study: 'CS201' },
  { id: 's2', name: 'Emma Schmidt', email: 'e.schmidt@school.edu',   date_created: '2026-01-15', module_study: 'CS201,CS210' },
  { id: 's3', name: 'Marko Jurić',  email: 'marko.juric@school.edu', date_created: '2026-02-20', module_study: '' },
  { id: 's4', name: 'Nina Berger',  email: 'nina.berger@school.edu', date_created: '2026-04-02', module_study: 'CS210' },
];

const MOCK_MODULES = [
  { id: 'm1', name: 'Introduction to Databases', code: 'CS201', teacher_id: 't1', teacher_name: 'Ana Kovač',    description: 'Relational design and SQL.' },
  { id: 'm2', name: 'Web Development',           code: 'CS210', teacher_id: 't2', teacher_name: 'David Miller', description: 'HTML, CSS, React.' },
];

/* ---------- Real endpoints ---------- */

export async function fetchDashboard(role) {
  const json = await request(`/api/dashboard/${role}`);
  return json.data;
}

export async function createTeacher(email) {
  const json = await request('/admin/create-teacher', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return json.message;
}

export async function createModule({ name, code, description, teacher_id }) {
  const json = await request('/api/modules', {
    method: 'POST',
    body: JSON.stringify({ name, code, description, teacher_id: teacher_id || null }),
  });
  return json.message;
}

/* ---------- Lists ---------- */

export async function fetchTeachers() {
  if (USE_MOCK.teachers) return mock(MOCK_TEACHERS);
  const json = await request('/admin/users');
  return (json.users || []).filter(u => u.role === 'teacher');
}

export async function fetchStudents() {
  if (USE_MOCK.students) return mock(MOCK_STUDENTS);
  const json = await request('/admin/users');
  return (json.users || []).filter(u => u.role === 'student');
}

export async function fetchModules() {
  if (USE_MOCK.modules) return mock(MOCK_MODULES);
  const json = await request('/api/modules');
  return json.modules || [];
}

/* ---------- Awaiting backend ---------- */

export async function setUserPassword(userId, newPassword) {
  if (USE_MOCK.setPassword) {
    await mock(null, 400);
    return 'Password updated (not saved — endpoint pending).';
  }
  const json = await request(`/admin/users/${userId}/password`, {
    method: 'PUT',
    body: JSON.stringify({ new_password: newPassword }),
  });
  return json.message;
}

export async function assignModules(userId, moduleCodes) {
  if (USE_MOCK.assignModules) {
    await mock(null, 400);
    return 'Modules assigned (not saved — endpoint pending).';
  }
  const json = await request(`/admin/users/${userId}/modules`, {
    method: 'PUT',
    body: JSON.stringify({ module_study: moduleCodes.join(',') }),
  });
  return json.message;
}

export function isMock(key) {
  return USE_MOCK[key];
}