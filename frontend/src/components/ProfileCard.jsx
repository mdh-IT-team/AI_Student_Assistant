import React from 'react';

export default function ProfileCard({ user, loading, error }) {
  if (loading) {
    return <div className="profile-card loading-skeleton">Loading profile data...</div>;
  }

  if (error) {
    return <div className="profile-card profile-error">⚠️ {error}</div>;
  }

  return (
    <div className="welcome-widget" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <h2>Hello, {user?.full_name || 'Student'}! 👋</h2>
        <p style={{ color: '#64748b' }}>{user?.email || 'No email associated'}</p>
        <p style={{ color: '#4f46e5', fontSize: '0.85rem', marginTop: '5px', fontWeight: 'bold' }}>Status: Authenticated ✓</p>
      </div>
      <div style={{ fontSize: '3.5rem' }}>🎓</div>
    </div>
  );
}