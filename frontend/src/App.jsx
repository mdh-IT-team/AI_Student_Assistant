import React, {
  useEffect,
  useState,
} from 'react';

import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgetPage from './components/ForgetPage';

import DashboardStudentPage from './components/DashboardStudentPage';
import DashboardAdminPage from './components/DashboardAdminPage';
import DashboardTeacherPage from './components/DashboardTeacherPage';

import FeaturesPage from './components/FeaturesPage';
import AboutPage from './components/AboutPage';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';

import {
  fetchRole,
  isTokenValid,
  logout,
  pageForRole,
} from './auth';

function App() {
  const [currentPage, setCurrentPage] =
    useState('home');

  useEffect(() => {
    async function restoreSession() {
      if (!isTokenValid()) {
        return;
      }

      try {
        const role = await fetchRole();

        if (role) {
          setCurrentPage(pageForRole(role));
        } else {
          logout();
          setCurrentPage('login');
        }
      } catch (error) {
        console.error(
          'Failed to restore session:',
          error
        );

        logout();
        setCurrentPage('login');
      }
    }

    restoreSession();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={setCurrentPage}
          />
        );

      case 'features':
        return (
          <FeaturesPage
            onNavigate={setCurrentPage}
          />
        );

      case 'about':
        return (
          <AboutPage
            onNavigate={setCurrentPage}
          />
        );

      case 'privacy':
        return (
          <PrivacyPage
            onNavigate={setCurrentPage}
          />
        );

      case 'contact':
        return (
          <ContactPage
            onNavigate={setCurrentPage}
          />
        );

      case 'login':
        return (
          <LoginPage
            onNavigate={setCurrentPage}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onNavigate={setCurrentPage}
          />
        );

      case 'forgot':
        return (
          <ForgetPage
            onNavigate={setCurrentPage}
          />
        );

      case 'dashboard':
      case 'studentdashboard':
        return (
          <DashboardStudentPage
            onNavigate={setCurrentPage}
          />
        );

      case 'admindashboard':
        return (
          <DashboardAdminPage
            onNavigate={setCurrentPage}
          />
        );

      case 'teacherdashboard':
        return (
          <DashboardTeacherPage
            onNavigate={setCurrentPage}
          />
        );

      default:
        return (
          <HomePage
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;