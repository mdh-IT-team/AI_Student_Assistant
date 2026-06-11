import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/api.js';
import { MainDashboardView, AITutorView, TasksView, PlannerView, SettingsView } from './DashboardViews';
import '../styles/style.css';

export default function DashboardPage({ onNavigate }) {
  // Navigation active tab controller state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Authenticated user profile retrieval data hooks
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real authenticated profile values automatically upon interface mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile();
        setUserData(data); // Stores profile data fields (e.g., full_name, email)
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to load profile.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Simple state rendering controller router map
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MainDashboardView user={userData} loading={loading} error={error} />;
      case 'tutor':
        return <AITutorView />;
      case 'tasks':
        return <TasksView />;
      case 'planner':
        return <PlannerView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <MainDashboardView user={userData} loading={loading} error={error} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          <div className="logo">🤖 AI Student Assistant</div>
          <ul className="sidebar-menu">
            <li>
              <button 
                className={`sidebar-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-btn ${activeTab === 'tutor' ? 'active' : ''}`}
                onClick={() => setActiveTab('tutor')}
              >
                🔮 AI Tutor
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveTab('tasks')}
              >
                📋 Tasks
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-btn ${activeTab === 'planner' ? 'active' : ''}`}
                onClick={() => setActiveTab('planner')}
              >
                📅 Study Planner
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </li>
          </ul>
        </div>
        <a href="#logout" className="sidebar-logout" onClick={() => {
          localStorage.removeItem('token'); // Flush auth token on logout
          onNavigate('home');
        }}>🚪 Logout</a>
      </aside>

      {/* Main Panel Frame container view */}
      <main className="main-content">
        <header className="top-header">
          <input type="text" placeholder="Search anything..." className="search-bar" />
          <div className="header-actions">
            <span>🔔</span>
            <div className="profile-widget">
              <div className="avatar"></div>
              {/* Displays loaded name dynamically into global visual header layout */}
              <span>{loading ? 'Loading...' : `Hi, ${userData?.full_name || 'User'}! ▾`}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Feature Content Area */}
        <div className="view-container">
          {renderActiveContent()}
        </div>
      </main>
    </div>
  );
}