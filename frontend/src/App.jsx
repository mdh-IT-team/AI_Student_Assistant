import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DashboardAdminPage from './components/DashboardAdminPage';
import DashboardTeacherPage from './components/DashboardTeacherPage';
import DashboardStudentPage from './components/DashboardStudentPage';
import RegisterPage from './components/RegisterPage';
import ForgetPage from './components/ForgetPage';
import { isTokenValid, fetchRole, pageForRole, logout } from './auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    if (!isTokenValid()) return;

    fetchRole().then(role => {
      if (role) {
        setCurrentPage(pageForRole(role));
      } else {
        logout();
        setCurrentPage('login');
      }
    });
  }, []);

  return (
    <div className="App">
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
      {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
      {currentPage === 'forgot' && <ForgetPage onNavigate={setCurrentPage} />}
      {currentPage === 'admindashboard' && <DashboardAdminPage onNavigate={setCurrentPage} />}
      {currentPage === 'teacherdashboard' && <DashboardTeacherPage onNavigate={setCurrentPage} />}
      {currentPage === 'studentdashboard' && <DashboardStudentPage onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;