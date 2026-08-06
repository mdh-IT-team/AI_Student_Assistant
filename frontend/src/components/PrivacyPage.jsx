import React from 'react';

import {
  Cookie,
  Database,
  LockKeyhole,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import PublicLayout from './PublicLayout';

import '../styles/style.css';

const privacySections = [
  {
    icon: Database,
    title:
      '1. Information we process',
    paragraphs: [
      'The platform may process account information such as your name, email address, user role, and account identifier.',
      'It may also process information that you submit while using academic features, forms, learning resources, or communication tools.',
    ],
  },
  {
    icon: UserCheck,
    title:
      '2. How information is used',
    paragraphs: [
      'Information is used to provide account access, display relevant dashboard content, operate platform features, maintain security, and improve the reliability of the service.',
      'User roles may be used to determine which pages, information, and actions are available to a student, teacher, or administrator.',
    ],
  },
  {
    icon: LockKeyhole,
    title:
      '3. Authentication and security',
    paragraphs: [
      'Account access is protected through authenticated sessions and role-based permissions.',
      'Users should keep their login credentials private, use strong passwords, and report suspected unauthorized access.',
    ],
  },
  {
    icon: ShieldCheck,
    title:
      '4. Data sharing',
    paragraphs: [
      'Personal information is not intended to be sold.',
      'Information may be processed by service providers required to operate the platform, such as authentication, database, hosting, or email providers. Information may also be disclosed when legally required.',
    ],
  },
  {
    icon: Database,
    title:
      '5. Data retention',
    paragraphs: [
      'Information should only be retained for as long as required to operate the service, support academic administration, maintain security, or meet applicable legal obligations.',
    ],
  },
  {
    icon: UserCheck,
    title:
      '6. Your choices and rights',
    paragraphs: [
      'Depending on the applicable data protection law, users may have the right to request access to, correction of, restriction of, or deletion of their personal information.',
      'Requests can be submitted through the Contact page and may require identity verification.',
    ],
  },
  {
    icon: Cookie,
    title:
      '7. Cookies and local storage',
    paragraphs: [
      'The application may use browser storage or similar technologies to maintain login sessions, remember interface preferences, and support essential platform functions.',
    ],
  },
];

export default function PrivacyPage({
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
      currentPage="privacy"
      onNavigate={onNavigate}
    >
      <section className="public-hero compact-hero privacy-hero">
        <div className="section-kicker">
          <LockKeyhole size={18} />

          <span>
            Privacy and data
          </span>
        </div>

        <h1>
          Your information should be
          handled with{' '}
          <span>
            care and transparency
          </span>
        </h1>

        <p>
          This privacy page explains the
          general principles followed by
          AI Student Assistant when
          processing user information.
        </p>
      </section>

      <section className="public-content-section narrow-content">
        <article className="legal-card">
          <div className="legal-header">
            <div>
              <span className="section-label">
                Privacy notice
              </span>

              <h2>
                AI Student Assistant
              </h2>
            </div>

            <div className="legal-meta">
              Last updated:
              {' '}
              6 August 2026
            </div>
          </div>

          <div className="legal-intro">
            <strong>
              Important:
            </strong>

            <span>
              This is a general project
              privacy statement. Before a
              public production launch, it
              should be reviewed and
              completed with the
              institution&apos;s official
              legal identity, address,
              data protection contact,
              hosting information, and
              applicable data-processing
              agreements.
            </span>
          </div>

          {privacySections.map(section => {
            const Icon = section.icon;

            return (
              <section
                className="legal-section"
                key={section.title}
              >
                <div className="legal-section-heading">
                  <div className="legal-icon">
                    <Icon size={20} />
                  </div>

                  <h2>
                    {section.title}
                  </h2>
                </div>

                {section.paragraphs.map(
                  paragraph => (
                    <p key={paragraph}>
                      {paragraph}
                    </p>
                  )
                )}
              </section>
            );
          })}

          <section className="legal-section">
            <div className="legal-section-heading">
              <div className="legal-icon">
                <ShieldCheck size={20} />
              </div>

              <h2>
                8. Changes to this notice
              </h2>
            </div>

            <p>
              This privacy notice may be
              updated when platform
              functionality, service
              providers, or data practices
              change. The latest version
              will be displayed on this
              page.
            </p>
          </section>

          <section className="legal-section">
            <div className="legal-section-heading">
              <div className="legal-icon">
                <UserCheck size={20} />
              </div>

              <h2>
                9. Contact
              </h2>
            </div>

            <p>
              For a privacy-related
              request, open the Contact
              page and select
              “Privacy or data request”
              as the subject.
            </p>

            <button
              type="button"
              className="btn-outline legal-contact-button"
              onClick={() =>
                handleNavigation('contact')
              }
            >
              Open Contact Page
            </button>
          </section>
        </article>
      </section>
    </PublicLayout>
  );
}