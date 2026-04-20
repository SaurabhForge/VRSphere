import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ROOM_ICONS = { classroom: '🎓', auditorium: '🎭', lounge: '☕' };
const ROOM_COLORS = {
  classroom: 'var(--primary)',
  auditorium: 'var(--accent)',
  lounge: 'hsl(38,95%,60%)',
};

function Countdown({ startTime }) {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start - now;

  if (diff <= 0) return <span style={{ color: 'var(--success)', fontWeight: 700 }}>🔴 Live Now</span>;

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return (
    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
      {days > 0 ? `in ${days}d ${hrs}h` : hrs > 0 ? `in ${hrs}h ${mins}m` : `in ${mins}m`}
    </span>
  );
}

export default function EventCard({ event, onDelete, currentUserId }) {
  const navigate = useNavigate();
  const isHost = event.host?._id === currentUserId || event.host === currentUserId;
  const color = ROOM_COLORS[event.roomType] || ROOM_COLORS.classroom;

  const handleJoin = () => navigate(`/lobby/${event._id}`);

  return (
    <div className="card event-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Top accent strip */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div className={`room-icon room-${event.roomType}`} style={{ fontSize: '1.4rem' }}>
            {ROOM_ICONS[event.roomType] || '🌐'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {event.roomType}
              </span>
              {isHost && (
                <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>host</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5,
                       overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {event.description}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>📅</span>
            <span>{new Date(event.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>👥</span>
            <span>{event.attendees?.length || 0} / {event.maxAttendees} attendees</span>
            <span style={{ marginLeft: 'auto' }}>
              <Countdown startTime={event.startTime} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>🔑</span>
            <code style={{ background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 6, letterSpacing: '0.1em', fontWeight: 700, fontSize: '0.8rem' }}>
              {event.joinCode}
            </code>
          </div>
        </div>

        {/* Host */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <img src={event.host?.avatar} alt={event.host?.name} style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--glass-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{event.host?.name}</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleJoin} className="btn btn-primary" style={{ flex: 1 }}>
            🚀 Join Room
          </button>
          {isHost && (
            <button onClick={() => onDelete?.(event._id)} className="btn btn-secondary" style={{ padding: '10px 14px' }}>
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
