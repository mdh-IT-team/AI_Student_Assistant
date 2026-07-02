import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DashboardAdminPage from './components/DashboardAdminPage';
import RegisterPage from './components/RegisterPage';
import ForgetPage from './components/ForgetPage';
import DashboardTeacherPage from './components/DashboardTeacherPage';
import { isTokenValid } from './auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // On first load / refresh: if a valid token exists, restore the session.
  useEffect(() => {
    if (isTokenValid()) {
      setCurrentPage('admindashboard');
    }
  }, []);

  return (
    <div className="App">
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
      {currentPage === 'admindashboard' && <DashboardAdminPage onNavigate={setCurrentPage} />}
      {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
      {currentPage === 'forgot' && <ForgetPage onNavigate={setCurrentPage} />}
      {currentPage === 'teacher' && <DashboardTeacherPage onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;