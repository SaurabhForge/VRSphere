import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { FiSend, FiSmile } from 'react-icons/fi';

const REACTIONS = ['👍', '❤️', '😂', '😮', '👏', '🔥'];

export default function ChatPanel({ messages = [], onSend, onReaction, participants = [] }) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live Chat</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{participants.length} in room</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {REACTIONS.map((r) => (
            <button
              key={r}
              onClick={() => onReaction?.(r)}
              style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', padding: 3, borderRadius: 6, transition: 'transform 0.15s' }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.3)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              title={`React ${r}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem', marginTop: 40 }}>
            <p style={{ fontSize: '2rem', marginBottom: 8 }}>💬</p>
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="chat-msg">
            <img
              className="chat-msg-avatar"
              src={msg.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.userName)}&background=7c3aed&color=fff`}
              alt={msg.userName}
            />
            <div className="chat-msg-content">
              <div className="chat-msg-name">{msg.userName}</div>
              <div className="chat-msg-text">{msg.message}</div>
              <div className="chat-msg-time">
                {format(new Date(msg.timestamp), 'HH:mm')}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Participants strip */}
      {participants.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {participants.map((p) => (
            <div key={p.socketId} style={{ textAlign: 'center', flexShrink: 0 }}>
              <img
                src={p.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.userName)}&background=7c3aed&color=fff&size=64`}
                alt={p.userName}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--primary)', display: 'block' }}
                title={p.userName}
              />
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="form-input"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={!text.trim()} style={{ padding: '10px 14px' }}>
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
}
