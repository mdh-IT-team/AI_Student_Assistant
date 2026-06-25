import React, { useState } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DashboardAdminPage from './components/DashboardAdminPage';
import RegisterPage from './components/RegisterPage';
import ForgetPage from './components/ForgetPage';
import DashboardTeacherPage from './components/DashboardTeacherPage';
function App() {
  const [currentPage, setCurrentPage] = useState('teacher');

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