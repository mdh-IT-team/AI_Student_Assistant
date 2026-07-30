import { getToken } from './auth';

export async function fetchDashboard(role) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`http://localhost:8000/api/dashboard/${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const json = await res.json();
  if (json.status !== 'Success') throw new Error(json.message || 'Request failed');
  return json.data;
}