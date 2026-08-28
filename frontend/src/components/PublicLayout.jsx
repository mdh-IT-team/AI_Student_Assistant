import React from 'react';

import '../styles/style.css';

const navigationItems = [
  {
    page: 'home',
    label: 'Home',
  },
  {
    page: 'features',
    label: 'Features',
  },
  {
    page: 'about',
    label: 'About',
  },
];

export default function PublicLayout({
  currentPage,
  onNavigate,
  children,
}) {
  const navigateTo = page => event => {
    event.preventDefault();

    onNavigate(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleLogin = () => {
    onNavigate('login');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="homepage-wrapper public-site">
      <nav className="navbar public-navbar">
        <a
          href="#home"
          className="logo logo-link"
          onClick={navigateTo('home')}
        >
          <span
            className="logo-icon"
            aria-hidden="true"
          >
            🤖
          </span>

          <span>
            AI Student Assistant
          </span>
        </a>

        <ul className="nav-links">
          {navigationItems.map(item => (
            <li key={item.page}>
              <a
                href={`#${item.page}`}
                className={
                  currentPage === item.page
                    ? 'active'
                    : ''
                }
                onClick={navigateTo(
                  item.page
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn-primary"
          onClick={handleLogin}
        >
          Login
        </button>
      </nav>

      <main className="public-main">
        {children}
      </main>

      <footer className="footer public-footer">
        <div className="footer-brand">
          <strong>
            AI Student Assistant
          </strong>

          <p>
            Supporting smarter and more
            organized learning.
          </p>
        </div>

        <div className="footer-links">
          <a
            href="#about"
            onClick={navigateTo('about')}
          >
            About
          </a>

          <a
            href="#features"
            onClick={navigateTo(
              'features'
            )}
          >
            Features
          </a>

          <a
            href="#privacy"
            onClick={navigateTo(
              'privacy'
            )}
          >
            Privacy
          </a>

          <a
            href="#contact"
            onClick={navigateTo(
              'contact'
            )}
          >
            Contact
          </a>
        </div>

        <div className="footer-copyright">
          &copy; 2026 AI Student Assistant
        </div>
      </footer>
    </div>
  );
}