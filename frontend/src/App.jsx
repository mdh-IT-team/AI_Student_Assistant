import React, { useState } from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import RegisterPage from './components/RegisterPage';
import ForgetPage from './components/ForgetPage';
import FeaturesPage from './components/FeaturesPage';
import AboutPage from './components/AboutPage';
import './styles/style.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="App">
      {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
      {currentPage === 'login' && <LoginPage onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === 'register' && <RegisterPage onNavigate={setCurrentPage} />}
      {currentPage === 'forgot' && <ForgetPage onNavigate={setCurrentPage} />}
      {currentPage === 'features' && <FeaturesPage onNavigate={setCurrentPage} />}
      {currentPage === 'about' && <AboutPage onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;