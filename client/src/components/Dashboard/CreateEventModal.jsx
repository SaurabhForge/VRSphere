import React, { useState } from 'react';
import { createEvent } from '../../services/api';
import { FiX } from 'react-icons/fi';

const ROOM_TYPES = [
  { id: 'classroom',  label: 'Classroom',  icon: '🎓', desc: 'Lecture hall with rows & a projector' },
  { id: 'auditorium', label: 'Auditorium', icon: '🎭', desc: 'Tiered theater seating for large events' },
  { id: 'lounge',     label: 'Lounge',     icon: '☕', desc: 'Cozy circular space for small groups' },
];

export default function CreateEventModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    roomType: 'classroom',
    maxAttendees: 20,
    tags: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.startTime || !form.endTime) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const { data } = await createEvent(payload);
      onCreated(data);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.3rem', fontFamily: 'Outfit' }}>Create Event</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Step {step} of 2
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <FiX size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.87rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input className="form-input" placeholder="e.g. Advanced React Workshop" value={form.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" placeholder="What is this event about?" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input className="form-input" type="datetime-local" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input className="form-input" type="datetime-local" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" placeholder="react, frontend, workshop" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Attendees</label>
                  <input className="form-input" type="number" min={2} max={100} value={form.maxAttendees} onChange={(e) => set('maxAttendees', parseInt(e.target.value))} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Next: Choose Room →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Select the virtual environment for your event:
              </p>
              {ROOM_TYPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => set('roomType', r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: form.roomType === r.id ? 'var(--primary-glow)' : 'var(--surface-2)',
                    border: form.roomType === r.id ? '2px solid var(--primary)' : '2px solid var(--glass-border)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontFamily: 'Outfit', marginBottom: 2 }}>{r.label}</p>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                  </div>
                  {form.roomType === r.id && (
                    <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontSize: '1.2rem' }}>✓</span>
                  )}
                </button>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating…' : '🚀 Create Event'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
