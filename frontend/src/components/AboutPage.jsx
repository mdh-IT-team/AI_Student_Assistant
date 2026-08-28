import React from 'react';

import {
  BookOpen,
  BrainCircuit,
  Lightbulb,
  Target,
  Users,
} from 'lucide-react';

import PublicLayout from './PublicLayout';

import '../styles/style.css';

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    description:
      'Make academic support easier to access and help users remain confident, informed, and organized.',
  },
  {
    icon: Lightbulb,
    title: 'Our Approach',
    description:
      'Combine helpful AI assistance with practical university tools inside a clear and familiar interface.',
  },
  {
    icon: Users,
    title: 'Who It Supports',
    description:
      'Provide a shared platform for students, teachers, and administrators, with tools adapted to each role.',
  },
];

export default function AboutPage({
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
      currentPage="about"
      onNavigate={onNavigate}
    >
      <section className="public-hero compact-hero">
        <div className="section-kicker">
          <BookOpen size={18} />

          <span>
            About the platform
          </span>
        </div>

        <h1>
          Helping education feel more{' '}
          <span>
            clear, connected, and
            manageable
          </span>
        </h1>

        <p>
          AI Student Assistant is a
          digital academic workspace
          designed to support students,
          teachers, and administrators in
          their everyday university
          activities.
        </p>

        <div className="public-hero-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              handleNavigation('features')
            }
          >
            Explore Features
          </button>

          <button
            type="button"
            className="btn-outline"
            onClick={() =>
              handleNavigation('contact')
            }
          >
            Contact Us
          </button>
        </div>
      </section>

      <section className="public-content-section">
        <div className="about-story">
          <div className="about-story-heading">
            <div className="public-icon large-icon">
              <BrainCircuit size={30} />
            </div>

            <span className="section-label">
              Our purpose
            </span>

            <h2>
              Technology that supports
              learning instead of
              complicating it
            </h2>
          </div>

          <div className="about-story-content">
            <p>
              Academic life often involves
              separate systems for course
              materials, schedules,
              communication, assignments,
              and progress. Moving between
              many disconnected tools can
              make simple academic work
              unnecessarily difficult.
            </p>

            <p>
              AI Student Assistant brings
              important university
              activities into one
              consistent and easy-to-use
              environment. The goal is to
              give users faster access to
              the information and tools
              they need.
            </p>

            <p>
              Students can focus on their
              learning, teachers can
              support their classes, and
              administrators can manage
              important platform
              functions.
            </p>
          </div>
        </div>

        <div className="section-heading about-values-heading">
          <span className="section-label">
            Our values
          </span>

          <h2>
            What guides the project
          </h2>

          <p>
            The platform is developed
            around accessibility,
            simplicity, and useful
            academic support.
          </p>
        </div>

        <div className="public-card-grid three-column-grid">
          {values.map(value => {
            const Icon = value.icon;

            return (
              <article
                className="public-info-card"
                key={value.title}
              >
                <div className="public-icon">
                  <Icon size={25} />
                </div>

                <h3>
                  {value.title}
                </h3>

                <p>
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="public-cta">
          <div>
            <h2>
              Have a question about the
              project?
            </h2>

            <p>
              Visit the contact page and
              send your question or
              feedback to the team.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              handleNavigation('contact')
            }
          >
            Contact the Team
          </button>
        </div>
      </section>
    </PublicLayout>
  );
}