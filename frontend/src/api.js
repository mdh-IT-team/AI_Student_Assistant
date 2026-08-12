import { getToken } from './auth';

const BASE = 'http://localhost:8000';

// Flip to false as each backend endpoint goes live.
export const USE_MOCK = {
  teachers: false,
  students: false,
  modules: true,        // no GET /api/modules yet
  setPassword: true,    // no admin password endpoint yet
  assignModules: true,  // enroll works, but needs module IDs from the list above
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

const MOCK_MODULES = [
  { id: 'm1', name: 'Introduction to Databases', code: 'CS201', teacher_name: 'Ana Kovač',    description: 'Relational design and SQL.' },
  { id: 'm2', name: 'Web Development',           code: 'CS210', teacher_name: 'David Miller', description: 'HTML, CSS, React.' },
];

/* ---------- Real ---------- */

export async function fetchDashboard(role) {
  const json = await request(`/api/dashboard/${role}`);
  return json.data;
}

async function fetchUsers() {
  const json = await request('/admin/users');
  return json.users || [];
}

export async function fetchTeachers() {
  return (await fetchUsers()).filter(u => u.role === 'teacher');
}

export async function fetchStudents() {
  return (await fetchUsers()).filter(u => u.role === 'student');
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

export async function enrollStudent(moduleId, studentId, semester) {
  const json = await request(`/api/modules/${moduleId}/enroll/${studentId}/${semester}`, {
    method: 'POST',
  });
  return json.message;
}

export async function unenrollStudent(moduleId, studentId) {
  const json = await request(`/api/modules/${moduleId}/enroll/${studentId}`, {
    method: 'DELETE',
  });
  return json.message;
}

export async function fetchModuleStudents(moduleId) {
  const json = await request(`/api/modules/${moduleId}/students`);
  return json.students || [];
}

/* ---------- Awaiting backend ---------- */

export async function fetchModules() {
  if (USE_MOCK.modules) return mock(MOCK_MODULES);
  const json = await request('/api/modules');
  return json.modules || [];
}

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

// Enrolls the modules that were newly ticked and removes the ones unticked.
export async function assignModules(studentId, moduleIds, previousIds = [], semester = 1) {
  if (USE_MOCK.assignModules) {
    await mock(null, 400);
    return 'Modules assigned (not saved — module list endpoint pending).';
  }
  const toAdd = moduleIds.filter(id => !previousIds.includes(id));
  const toRemove = previousIds.filter(id => !moduleIds.includes(id));

  await Promise.all([
    ...toAdd.map(id => enrollStudent(id, studentId, semester)),
    ...toRemove.map(id => unenrollStudent(id, studentId)),
  ]);
  return 'Enrollment updated.';
}

export function isMock(key) {
  return USE_MOCK[key];
}

/* ---------- File Management ---------- */

export async function uploadFileApi(file, description = '') {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);

  const res = await fetch(`${BASE}/api/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed (${res.status})`);
  }
  const json = await res.json();
  if (json.status !== 'Success') throw new Error(json.message || 'Upload failed');
  return json.file;
}

export async function fetchFilesApi() {
  const json = await request('/api/files/list');
  return json.files || [];
}

export async function downloadFileApi(fileId, fileName) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE}/api/files/download/${fileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || 'downloaded-file';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function deleteFileApi(fileId) {
  const json = await request(`/api/files/${fileId}`, {
    method: 'DELETE',
  });
  return json.message;
}