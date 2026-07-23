// Simple JWT auth helpers backed by localStorage.

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;

  const notExpired = payload.exp * 1000 > Date.now();
  if (!notExpired) {
    localStorage.removeItem('token');
  }
  return notExpired;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}

// Fetch the full current user object from the backend.
export async function fetchMe() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch('http://localhost:8000/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.status === 'Success' ? data.user : null;
  } catch {
    return null;
  }
}

// Ask the backend who this token belongs to, and return their role.
export async function fetchRole() {
  const user = await fetchMe();
  return user ? user.role : null;
}

// Map a role to its dashboard page key.
export function pageForRole(role) {
  if (role === 'admin') return 'admindashboard';
  if (role === 'teacher') return 'teacherdashboard';
  if (role === 'student') return 'studentdashboard';
  return 'login';
}