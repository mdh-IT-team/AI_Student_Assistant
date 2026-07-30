import React, { useState, useRef, useEffect } from 'react';
import { getToken } from '../auth';

const API_BASE = 'http://localhost:8000';

const ROLE_CONFIG = {
  admin: {
    title: 'AI Assistant',
    subtitle: 'Ask me anything about your institution',
    placeholder: 'Talk to me...',
    greeting: (name) =>
      `Hi ${name || 'there'}! I can help with teacher invites, enrollment numbers, modules, and general admin questions.`,
    fallbackIntro: (name) =>
      `Hi ${name || 'there'}, as an admin assistant I can help with staff, enrollment, and institution-wide questions.`,
  },
  teacher: {
    title: 'AI Assistant',
    subtitle: 'Ask me to summarize a module, draft an announcement, or suggest material.',
    placeholder: 'Ask me anything...',
    greeting: (name) =>
      `Hi ${name || 'there'}! I can help you plan lessons, summarize your modules, or draft messages to students.`,
    fallbackIntro: (name) =>
      `Hi ${name || 'there'}, as your teaching assistant I can help you plan lessons, summarize modules, or draft messages to students.`,
  },
  student: {
    title: 'AI Tutor',
    subtitle: 'What would you like to learn today?',
    placeholder: 'Ask me anything...',
    greeting: (name) =>
      `Hi ${name || 'there'}! Ask me to explain a topic, quiz you, or help you study for a module.`,
    fallbackIntro: (name) =>
      `Hi ${name || 'there'}, as your AI tutor I can help explain concepts, quiz you, or help you study.`,
  },
};

// When a module is supplied the chat is scoped to that module's materials.
function moduleConfig(moduleName) {
  return {
    title: `Materials — ${moduleName}`,
    subtitle: `Ask about readings, slides, and coursework for ${moduleName}.`,
    placeholder: `Ask about ${moduleName}...`,
    greeting: (name) =>
      `Hi ${name || 'there'}! Ask me anything about ${moduleName} — its materials, topics, or how to prepare.`,
    fallbackIntro: (name) =>
      `Hi ${name || 'there'}, I'm here to help with ${moduleName}.`,
  };
}

export default function AiChatBox({ role = 'student', userName = '', moduleName = '' }) {
  const config = moduleName
    ? moduleConfig(moduleName)
    : (ROLE_CONFIG[role] || ROLE_CONFIG.student);

  const [messages, setMessages] = useState([
    { sender: 'ai', text: config.greeting(userName) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const scrollRef = useRef(null);

  // userName arrives asynchronously, so refresh the greeting while it's
  // still the untouched first message.
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1 && prev[0].sender === 'ai'
        ? [{ sender: 'ai', text: config.greeting(userName) }]
        : prev
    );
  }, [userName, config]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function localReply(text) {
    return `${config.fallbackIntro(userName)}\n\nYou asked: "${text}"\n\n(Placeholder reply — the chat endpoint isn't connected yet.)`;
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          role,
          ...(moduleName ? { module: moduleName } : {}),
        }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const data = await res.json();
      if (data.status !== 'Success') throw new Error(data.message || 'Something went wrong');

      setOffline(false);
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
    } catch {
      setOffline(true);
      setMessages((prev) => [...prev, { sender: 'ai', text: localReply(text) }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      className="dashboard-panel"
      style={{ display: 'flex', flexDirection: 'column', minHeight: moduleName ? '55vh' : '70vh' }}
    >
      <div className="panel-header">
        <h3>{config.title}</h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
        {config.subtitle}
      </p>

      {offline && (
        <p style={{
          fontSize: '0.8rem', color: '#b45309', background: '#fffbeb',
          padding: '8px 12px', borderRadius: '6px', marginBottom: '12px',
        }}>
          Replying locally — the chat endpoint isn't available yet.
        </p>
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          gap: '10px', paddingRight: '4px', marginBottom: '10px',
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
              borderRadius: '12px', padding: '8px 12px', fontSize: '0.9rem',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}
          >
            {m.text}
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start', color: 'var(--text-muted)',
            fontSize: '0.85rem', padding: '4px 12px',
          }}>
            Thinking...
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder={config.placeholder}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="btn-primary" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}