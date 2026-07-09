import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgetPage from './components/ForgetPage';
import DashboardStudentPage from './components/DashboardStudentPage';
import DashboardAdminPage from './components/DashboardAdminPage';
import DashboardTeacherPage from './components/DashboardTeacherPage';
import { isTokenValid } from './auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardStudentPage onNavigate={setCurrentPage} />;
      case 'admindashboard':
        return <DashboardAdminPage onNavigate={setCurrentPage} />;
      case 'teacherdashboard':
        return <DashboardTeacherPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };
   return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;