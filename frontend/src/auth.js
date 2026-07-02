// Simple JWT auth helpers backed by localStorage.

// Decode a JWT payload (middle part) without any library.
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Is the token present and not expired?
export function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) return false;

  // exp is in seconds; Date.now() is in ms.
  const notExpired = payload.exp * 1000 > Date.now();
  if (!notExpired) {
    localStorage.removeItem('token'); // clean up expired token
  }
  return notExpired;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}