import React from 'react';

import {
  BarChart3,
  Calendar,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

import PublicLayout from './PublicLayout';

import '../styles/style.css';

const homeFeatures = [
  {
    icon: MessageSquare,
    title: 'AI Tutoring',
    description:
      'Get explanations and helpful answers to your study questions instantly.',
  },
  {
    icon: ClipboardList,
    title: 'Task Manager',
    description:
      'Organize assignments, set deadlines, and keep important work on track.',
  },
  {
    icon: Calendar,
    title: 'Study Planner',
    description:
      'Plan your study schedule and create a more productive learning routine.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Review your progress and continue working toward your academic goals.',
  },
];

export default function HomePage({
  onNavigate,
}) {
  const handleNavigation = page => {
    onNavigate(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <PublicLayout
      currentPage="home"
      onNavigate={onNavigate}
    >
      <section className="hero-section">
        <div className="hero-content">
          <div className="home-badge">
            Smarter academic support
          </div>

          <h1>
            Your{' '}
            <span>
              AI Study Companion
            </span>
          </h1>

          <p>
            Get instant help with your
            studies, manage academic
            tasks, access useful
            resources, and achieve your
            goals through one connected
            platform.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                handleNavigation('login')
              }
            >
              Get Started
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                handleNavigation('about')
              }
            >
              Learn More →
            </button>
          </div>

          <div className="hero-trust-row">
            <span>
              ✓ Simple interface
            </span>

            <span>
              ✓ Role-based access
            </span>

            <span>
              ✓ Academic tools
            </span>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-visual-card">
            <div className="hero-visual-top">
              <span className="hero-status-dot" />

              AI Student Assistant
            </div>

            <div className="hero-emoji-stack">
              <span className="hero-emoji hero-emoji-robot">
                🤖
              </span>

              <span className="hero-emoji hero-emoji-books">
                📚
              </span>
            </div>

            <div className="hero-question-card">
              Ask, learn, organize, and
              grow.
            </div>
          </div>
        </div>
      </section>

      <section className="features-container">
        <div className="section-heading">
          <span className="section-label">
            Main features
          </span>

          <h2>
            Everything you need for
            smarter learning
          </h2>

          <p>
            Use one familiar platform for
            study support, task planning,
            learning materials, and
            academic progress.
          </p>
        </div>

        <div className="features-grid">
          {homeFeatures.map(feature => {
            const Icon = feature.icon;

            return (
              <article
                className="feature-card"
                key={feature.title}
              >
                <div className="icon">
                  <Icon size={28} />
                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="text-link-button"
          onClick={() =>
            handleNavigation('features')
          }
        >
          Explore all features →
        </button>

        <div className="promo-banner">
          <div>
            <span className="section-label">
              Start today
            </span>

            <h3>
              Smarter Study. Better
              Results.
            </h3>

            <p>
              Sign in to access the tools
              available for your student,
              teacher, or administrator
              account.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              handleNavigation('login')
            }
          >
            Get Started for Free
          </button>
        </div>
      </section>
    </PublicLayout>
  );
}