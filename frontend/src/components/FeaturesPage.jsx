import React from 'react';

import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

import PublicLayout from './PublicLayout';

import '../styles/style.css';

const featureItems = [
  {
    icon: MessageSquare,
    title: 'AI Study Support',
    description:
      'Ask academic questions, review difficult topics, and receive clear explanations whenever you need assistance.',
  },
  {
    icon: ClipboardList,
    title: 'Task Management',
    description:
      'Organize assignments, priorities, and deadlines so important academic work is easier to manage.',
  },
  {
    icon: CalendarDays,
    title: 'Study Planning',
    description:
      'Create a structured learning schedule and divide larger academic goals into realistic study sessions.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Monitor academic activity, completed tasks, and progress toward your learning goals.',
  },
  {
    icon: FileText,
    title: 'Learning Materials',
    description:
      'Access course resources, uploaded documents, and important academic information from one workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description:
      'Students, teachers, and administrators receive tools and information suited to their responsibilities.',
  },
];

const benefitItems = [
  'Simple and familiar interface',
  'Fast access from each dashboard',
  'Useful for students and teaching staff',
  'Secure account-based access',
];

export default function FeaturesPage({
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
      currentPage="features"
      onNavigate={onNavigate}
    >
      <section className="public-hero compact-hero">
        <div className="section-kicker">
          <Bot size={18} />

          <span>
            Built for smarter learning
          </span>
        </div>

        <h1>
          Everything you need to stay{' '}
          <span>
            organized and supported
          </span>
        </h1>

        <p>
          AI Student Assistant combines
          study support, task planning,
          learning resources, and progress
          tools inside one simple
          platform.
        </p>

        <div className="public-hero-actions">
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
            About the Platform
          </button>
        </div>
      </section>

      <section className="public-content-section">
        <div className="section-heading">
          <span className="section-label">
            Main features
          </span>

          <h2>
            Academic tools in one place
          </h2>

          <p>
            Each feature is designed to
            reduce unnecessary complexity
            and make everyday university
            work easier.
          </p>
        </div>

        <div className="public-card-grid">
          {featureItems.map(feature => {
            const Icon = feature.icon;

            return (
              <article
                className="public-info-card"
                key={feature.title}
              >
                <div className="public-icon">
                  <Icon size={25} />
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

        <div className="split-feature-panel">
          <div className="split-panel-content">
            <span className="section-label">
              One connected platform
            </span>

            <h2>
              Designed around your
              academic journey
            </h2>

            <p>
              Instead of switching between
              several disconnected
              applications, users can
              access relevant tools,
              information, and assistance
              through one consistent
              dashboard experience.
            </p>

            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                handleNavigation('contact')
              }
            >
              Ask a Question
            </button>
          </div>

          <div className="benefit-list">
            {benefitItems.map(item => (
              <div
                className="benefit-item"
                key={item}
              >
                <CheckCircle2 size={20} />

                <span>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="public-cta">
          <div>
            <h2>
              Ready to improve your study
              workflow?
            </h2>

            <p>
              Sign in and explore the
              tools available for your
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
            Login to Continue
          </button>
        </div>
      </section>
    </PublicLayout>
  );
}