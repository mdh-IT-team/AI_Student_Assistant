import React, { useState, useRef, useEffect } from 'react';
import { getToken } from '../auth';

const API_BASE = 'http://localhost:8000';

// Per-role copy so the same component feels tailored to whoever is using it.
const ROLE_CONFIG = {
  admin: {
    title: 'AI Assistant',
    subtitle: 'Ask me anything about your institution',
    placeholder: 'Talk to me...',
    greeting: (name) =>
      `Hi ${name || 'there'}! I can help with teacher invites, enrollment numbers, modules, and general admin questions.`,
  },
  teacher: {
    title: 'AI Assistant',
    subtitle: 'Ask me to summarize a module, draft an announcement, or suggest material.',
    placeholder: 'Ask me anything...',
    greeting: (name) =>
      `Hi ${name || 'there'}! I can help you plan lessons, summarize your modules, or draft messages to students.`,
  },
  student: {
    title: 'AI Tutor',
    subtitle: 'What would you like to learn today?',
    placeholder: 'Ask me anything...',
    greeting: (name) =>
      `Hi ${name || 'there'}! Ask me to explain a topic, quiz you, or help you study for a module.`,
  },
};

/**
 * Reusable chat box: message input + response display.
 * Drop into any dashboard with a `role` prop ('admin' | 'teacher' | 'student')
 * and it calls POST /api/chat, sending the role so the backend / AI model
 * can tailor its behavior to who is asking.
 */
export default function AiChatBox({ role = 'student', userName = '' }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  const [messages, setMessages] = useState([
    { sender: 'ai', text: config.greeting(userName) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, role }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json();
      if (data.status !== 'Success') throw new Error(data.message || 'Something went wrong');

      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setError(err.message || 'Failed to reach the AI assistant.');
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <h3>{config.title}</h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
        {config.subtitle}
      </p>

      <div
        ref={scrollRef}
        style={{
          maxHeight: '320px',
          minHeight: '160px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingRight: '4px',
          marginBottom: '10px',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.sender === 'user' ? 'var(--primary-color)' : 'var(--bg-light)',
              color: m.sender === 'user' ? '#fff' : 'var(--text-dark)',
              border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              padding: '4px 12px',
            }}
          >
            Thinking...
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginBottom: '8px' }}>
          {error}
        </p>
      )}

      <div className="chat-input-container">
        <input
          type="text"
          placeholder={config.placeholder}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}