import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiLogOut, FiUsers, FiMessageSquare } from 'react-icons/fi';

export default function ControlBar({ audioEnabled, videoEnabled, onToggleAudio, onToggleVideo, onScreenShare, screenSharing, onLeave, participantCount = 0, showChat, onToggleChat }) {
  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const CtrlBtn = ({ onClick, active, danger, icon, label, pulse }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <button onClick={onClick} style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: danger ? 'var(--danger)' : active ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--surface-2)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: active ? 'var(--glow-primary)' : 'none', position: 'relative' }} title={label}>
        {icon}
        {pulse && <span style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2px solid var(--accent)', animation: 'pulse-ring 2s ease-out infinite' }} />}
      </button>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );

  return (
    <>
      <div className="vr-controls-bar">
        <CtrlBtn onClick={onToggleAudio} active={audioEnabled} icon={audioEnabled ? <FiMic size={18} /> : <FiMicOff size={18} />} label={audioEnabled ? 'Mute' : 'Unmute'} />
        <CtrlBtn onClick={onToggleVideo} active={videoEnabled} icon={videoEnabled ? <FiVideo size={18} /> : <FiVideoOff size={18} />} label={videoEnabled ? 'Cam On' : 'Cam Off'} />
        <CtrlBtn onClick={onScreenShare} active={screenSharing} icon={<FiMonitor size={18} />} label={screenSharing ? 'Stop Share' : 'Share'} pulse={screenSharing} />
        <div style={{ width: 1, height: 40, background: 'var(--glass-border)' }} />
        <CtrlBtn onClick={onToggleChat} active={showChat} icon={<FiMessageSquare size={18} />} label="Chat" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', position: 'relative' }}>
            <FiUsers size={18} color="var(--text-muted)" />
            <span style={{ position: 'absolute', top: -2, right: -2, background: 'var(--primary)', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{participantCount}</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>People</span>
        </div>
        <div style={{ width: 1, height: 40, background: 'var(--glass-border)' }} />
        <CtrlBtn onClick={() => setLeaveConfirm(true)} danger icon={<FiLogOut size={18} />} label="Leave" />
      </div>

      {leaveConfirm && (
        <div className="modal-overlay" onClick={() => setLeaveConfirm(false)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: 28 }}>
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚪</p>
              <h3 style={{ marginBottom: 8 }}>Leave the Room?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Your video and audio will disconnect.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setLeaveConfirm(false)}>Stay</button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={onLeave}>Leave Room</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
