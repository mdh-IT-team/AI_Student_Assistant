import React, {
  useState,
} from 'react';

import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';

import PublicLayout from './PublicLayout';

import '../styles/style.css';

const initialFormData = {
  name: '',
  email: '',
  subject: 'General question',
  message: '',
};

export default function ContactPage({
  onNavigate,
}) {
  const [formData, setFormData] =
    useState(initialFormData);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState('');

  const updateField = event => {
    const {
      name,
      value,
    } = event.target;

    setFormData(currentForm => ({
      ...currentForm,
      [name]: value,
    }));

    setSubmitted(false);
    setError('');
  };

  const submitForm = event => {
    event.preventDefault();

    const cleanName =
      formData.name.trim();

    const cleanEmail =
      formData.email.trim();

    const cleanMessage =
      formData.message.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanMessage
    ) {
      setError(
        'Please complete all required fields.'
      );

      return;
    }

    if (cleanMessage.length < 10) {
      setError(
        'Please enter a message with at least 10 characters.'
      );

      return;
    }

    const submittedData = {
      ...formData,
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    };

    console.log(
      'Contact form submitted:',
      submittedData
    );

    setSubmitted(true);
    setError('');
    setFormData(initialFormData);
  };

  return (
    <PublicLayout
      currentPage="contact"
      onNavigate={onNavigate}
    >
      <section className="public-hero compact-hero">
        <div className="section-kicker">
          <MessageCircle size={18} />

          <span>
            Contact the team
          </span>
        </div>

        <h1>
          How can we{' '}
          <span>
            help you?
          </span>
        </h1>

        <p>
          Send a question, report a
          technical problem, submit a
          privacy request, or share
          feedback about AI Student
          Assistant.
        </p>
      </section>

      <section className="public-content-section contact-layout">
        <aside className="contact-details">
          <span className="section-label">
            Get in touch
          </span>

          <h2>
            We would like to hear from you
          </h2>

          <p>
            Use the contact form for
            platform questions, technical
            problems, accessibility
            feedback, or privacy requests.
          </p>

          <div className="contact-method">
            <div className="public-icon">
              <Mail size={23} />
            </div>

            <div>
              <strong>
                Send a message
              </strong>

              <span>
                Complete the form with
                your contact details and
                question.
              </span>
            </div>
          </div>

          <div className="contact-method">
            <div className="public-icon">
              <Clock3 size={23} />
            </div>

            <div>
              <strong>
                Include useful details
              </strong>

              <span>
                When reporting a problem,
                include the page name,
                account role, and error
                message.
              </span>
            </div>
          </div>

          <div className="contact-method">
            <div className="public-icon">
              <ShieldCheck size={23} />
            </div>

            <div>
              <strong>
                Protect your account
              </strong>

              <span>
                Never include your
                password, access token, or
                other sensitive login
                information.
              </span>
            </div>
          </div>
        </aside>

        <form
          className="contact-form-card"
          onSubmit={submitForm}
          noValidate
        >
          <div className="contact-form-heading">
            <h2>
              Send us a message
            </h2>

            <p>
              Fields marked with an
              asterisk are required.
            </p>
          </div>

          {submitted && (
            <div
              className="form-success"
              role="status"
            >
              <CheckCircle2 size={21} />

              <span>
                Thank you. Your message
                has been recorded
                successfully.
              </span>
            </div>
          )}

          {error && (
            <div
              className="form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="contact-field-row">
            <label htmlFor="contact-name">
              Name *

              <input
                id="contact-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={updateField}
                required
                autoComplete="name"
                placeholder="Your full name"
              />
            </label>

            <label htmlFor="contact-email">
              Email *

              <input
                id="contact-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={updateField}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label htmlFor="contact-subject">
            Subject

            <select
              id="contact-subject"
              name="subject"
              value={formData.subject}
              onChange={updateField}
            >
              <option value="General question">
                General question
              </option>

              <option value="Technical support">
                Technical support
              </option>

              <option value="Privacy or data request">
                Privacy or data request
              </option>

              <option value="Accessibility feedback">
                Accessibility feedback
              </option>

              <option value="General feedback">
                General feedback
              </option>
            </select>
          </label>

          <label htmlFor="contact-message">
            Message *

            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={updateField}
              required
              rows="7"
              maxLength="2000"
              placeholder="Describe your question or problem..."
            />
          </label>

          <div className="message-character-count">
            {formData.message.length}
            /2000 characters
          </div>

          <button
            className="btn-primary contact-submit"
            type="submit"
          >
            <Send size={18} />

            <span>
              Send Message
            </span>
          </button>

          <p className="form-note">
            This form currently validates
            the information and shows a
            confirmation in the
            interface. A backend endpoint
            or email service is required
            before messages can be
            delivered to a real email
            address.
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}