import React from 'react';
import ProfileCard from './ProfileCard';
import '../styles/style.css';

export function MainDashboardView({ user, loading, error }) {
  return (
    <>
      {/* 1. Profile section card component handling authentication states */}
      <ProfileCard user={user} loading={loading} error={error} />

      <section className="stats-grid">
        <div className="stat-card"><h3>3</h3><p>Tasks Due Today 📋</p></div>
        <div className="stat-card"><h3>2</h3><p>Classes Today 🗓️</p></div>
        <div className="stat-card"><h3>85%</h3><p>Average Progress ✅</p></div>
        <div className="stat-card"><h3>12</h3><p>Study Streak 🔥</p></div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header"><h3>AI Tutor</h3></div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
            Hi {user?.full_name || 'there'}! What would you like to learn today?
          </p>
          <div className="chat-input-container">
            <input type="text" placeholder="Ask me anything..." className="chat-input" />
            <button className="btn-primary">Send</button>
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header"><h3>Today's Tasks</h3></div>
          <div className="task-item">
            <div>
              <input type="checkbox" id="t1" /> <label htmlFor="t1">Math Assignment</label>
            </div>
            <span className="badge high">High</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Reusable nested view containers for the structural sub-navigation views
export function AITutorView() { return <div className="dashboard-panel"><h2>🔮 AI Tutor Panel</h2><p>Ask complex logic operations or get custom curriculum advice.</p></div>; }
export function TasksView() { return <div className="dashboard-panel"><h2>📋 Tasks Manager</h2><p>Track assignments and configure target dates.</p></div>; }
export function PlannerView() { return <div className="dashboard-panel"><h2>📅 Study Planner</h2><p>Schedule your week or configure mock tracking dates.</p></div>; }
export function SettingsView() { return <div className="dashboard-panel"><h2>⚙️ Settings Panel</h2><p>Update personal profiles or authorization codes.</p></div>; }