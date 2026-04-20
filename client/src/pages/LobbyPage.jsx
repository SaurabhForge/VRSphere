import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useWebRTC } from '../contexts/WebRTCContext';
import { fetchEvent } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { motion } from 'framer-motion';

export default function LobbyPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { initLocalStream, localStream, audioEnabled, videoEnabled, toggleAudio, toggleVideo, cleanup } = useWebRTC();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const localVideoRef = useRef(null);

  // Load event
  useEffect(() => {
    fetchEvent(eventId)
      .then(({ data }) => setEvent(data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Init media
  useEffect(() => {
    initLocalStream(true, true).finally(() => setMediaLoading(false));
    return () => {}; // keep stream alive for room
  }, []);

  // Attach local stream to video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Socket lobby presence
  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('join-room', { roomId: `lobby-${eventId}`, userId: user._id, userName: user.name, userAvatar: user.avatar });
    socket.on('room-users', (users) => setWaitingUsers(users));
    socket.on('user-joined', (u) => setWaitingUsers((p) => [...p, u]));
    socket.on('user-left', ({ socketId }) => setWaitingUsers((p) => p.filter((u) => u.socketId !== socketId)));
    return () => {
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.emit('leave-room', { roomId: `lobby-${eventId}` });
    };
  }, [socket, user, eventId]);

  const handleEnterRoom = () => navigate(`/room/${eventId}`);

  if (loading) return <LoadingSpinner fullPage />;

  const ROOM_ICONS = { classroom: '🎓', auditorium: '🎭', lounge: '☕' };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, rgba(139,92,246,0.1), transparent 60%)', filter: 'blur(60px)' }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: 880, padding: '40px 24px' }}>
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <span style={{ fontSize: '3.5rem', display: 'inline-block', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                {ROOM_ICONS[event?.roomType] || '🌐'}
              </span>
            </motion.div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, margin: '16px 0 8px', letterSpacing: '-0.02em', color: '#fff' }}>{event?.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              Hosted by <strong style={{ color: '#fff' }}>{event?.host?.name}</strong> <span style={{ opacity: 0.5 }}>·</span> <span style={{ textTransform: 'capitalize' }}>{event?.roomType}</span> room
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
            {/* Camera preview */}
            <motion.div variants={itemVariants} className="card" style={{ padding: 24, background: 'rgba(24, 24, 27, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Your Preview</h3>
                <span className="badge badge-primary" style={{ background: 'rgba(139, 92, 246, 0.15)', border: 'none' }}>Ready</span>
              </div>
              <div className="participant-video" style={{ marginBottom: 24, borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)' }}>
                {mediaLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                    <LoadingSpinner size={32} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Accessing camera…</span>
                  </div>
                ) : (
                  <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {!videoEnabled && !mediaLoading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(39, 39, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>📷</span>
                  </div>
                )}
                <div className="participant-label">{user?.name} (You)</div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }} onClick={toggleAudio}>
                  {audioEnabled ? '🎙️ Mute' : '🔇 Unmute'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }} onClick={toggleVideo}>
                  {videoEnabled ? '📹 Cam Off' : '📷 Cam On'}
                </motion.button>
              </div>
            </motion.div>

            {/* Waiting room */}
            <motion.div variants={itemVariants} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', background: 'rgba(24, 24, 27, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Waiting Room</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '99px' }}>
                  {waitingUsers.length + 1} Ready
                </span>
              </div>
              <p style={{ color: 'var(--text-faint)', fontSize: '0.9rem', marginBottom: 24 }}>
                Join the others waiting to enter.
              </p>

              <div className="lobby-avatar-grid" style={{ flex: 1, alignContent: 'flex-start', gap: 20 }}>
                {/* Local user */}
                <motion.div whileHover={{ y: -4 }} className="lobby-avatar">
                  <div style={{ position: 'relative' }}>
                    <img src={user?.avatar} alt={user?.name} style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }} />
                    <div className="lobby-avatar-ring" style={{ inset: '-6px' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: 4 }}>You</span>
                </motion.div>
                {waitingUsers.map((u, i) => (
                  <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }} key={u.socketId} className="lobby-avatar">
                    <img
                      src={u.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.userName)}&background=7c3aed&color=fff`}
                      alt={u.userName}
                      style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 76, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 4 }}>{u.userName}</span>
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Room Code:</span>
                  <code style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', letterSpacing: '0.15em' }}>{event?.joinCode}</code>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigator.clipboard.writeText(event?.joinCode)}
                    style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '6px', fontWeight: 600 }}
                  >
                    Copy
                  </motion.button>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(139, 92, 246, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }} 
                  onClick={handleEnterRoom}
                >
                  🚀 Enter VR Room
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
