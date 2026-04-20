import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useWebRTC } from '../contexts/WebRTCContext';
import { fetchEvent } from '../services/api';
import VRScene from '../components/EventRoom/VRScene';
import ChatPanel from '../components/EventRoom/ChatPanel';
import ControlBar from '../components/EventRoom/ControlBar';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function EventRoomPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    localStream, remoteStreams,
    audioEnabled, videoEnabled,
    screenStream,
    initLocalStream, createPeer,
    handleOffer, handleAnswer, handleIceCandidate,
    removePeer, toggleAudio, toggleVideo,
    startScreenShare, stopScreenShare, cleanup,
  } = useWebRTC();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(true);
  const [reactions, setReactions] = useState([]);
  const [toast, setToast] = useState(null);
  const localVideoRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load event
  useEffect(() => {
    fetchEvent(eventId)
      .then(({ data }) => setEvent(data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Init media stream
  useEffect(() => {
    initLocalStream(true, true);
    return () => cleanup();
  }, []);

  // Attach local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Socket room events
  useEffect(() => {
    if (!socket || !user || !event) return;

    socket.emit('join-room', {
      roomId: eventId,
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
    });

    // Existing users — initiate offers
    socket.on('room-users', (users) => {
      setParticipants(users);
      users.forEach((u) => createPeer(u.socketId, socket, true));
    });

    socket.on('user-joined', (u) => {
      setParticipants((p) => [...p, u]);
      showToast(`${u.userName} joined the room`, 'info');
    });

    socket.on('user-left', ({ socketId }) => {
      setParticipants((p) => p.filter((u) => u.socketId !== socketId));
      removePeer(socketId);
    });

    // WebRTC signaling
    socket.on('webrtc-offer', (data) => handleOffer({ ...data, socket }));
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    // Chat
    socket.on('receive-message', (msg) => setMessages((p) => [...p, msg]));

    // Reactions
    socket.on('receive-reaction', ({ reaction, userName }) => {
      const id = Date.now();
      setReactions((p) => [...p, { id, reaction, userName }]);
      setTimeout(() => setReactions((p) => p.filter((r) => r.id !== id)), 3000);
    });

    return () => {
      socket.off('room-users');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('receive-message');
      socket.off('receive-reaction');
    };
  }, [socket, user, event]);

  const handleSendMessage = (text) => {
    if (!socket) return;
    socket.emit('send-message', {
      roomId: eventId,
      message: text,
      userId: user._id,
      userName: user.name,
      userAvatar: user.avatar,
    });
  };

  const handleReaction = (r) => {
    socket?.emit('send-reaction', { roomId: eventId, reaction: r, userName: user.name });
    const id = Date.now();
    setReactions((p) => [...p, { id, reaction: r, userName: 'You' }]);
    setTimeout(() => setReactions((p) => p.filter((x) => x.id !== id)), 3000);
  };

  const handleScreenShare = () => {
    if (screenStream) stopScreenShare(socket, eventId);
    else startScreenShare(socket, eventId);
  };

  const handleLeave = () => {
    cleanup();
    socket?.emit('leave-room', { roomId: eventId });
    navigate('/dashboard');
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="vr-room-wrapper">
      {/* Top bar */}
      <div style={{ height: 48, background: 'var(--surface)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', paddingLeft: 20, gap: 14, flexShrink: 0 }}>
        <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', background: 'linear-gradient(135deg,var(--primary),var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VRSphere</span>
        <span style={{ color: 'var(--glass-border)' }}>·</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>{event?.title}</span>
        <span className="badge badge-success" style={{ marginLeft: 'auto', marginRight: 16 }}>🔴 Live</span>
      </div>

      <div className="vr-room-layout">
        {/* VR Scene */}
        <div className="vr-scene-container">
          <VRScene
            roomType={event?.roomType || 'classroom'}
            participants={participants}
            localUser={user}
          />
          <ControlBar
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onScreenShare={handleScreenShare}
            screenSharing={!!screenStream}
            onLeave={handleLeave}
            participantCount={participants.length + 1}
            showChat={showChat}
            onToggleChat={() => setShowChat((p) => !p)}
          />

          {/* Floating reactions */}
          <div style={{ position: 'absolute', bottom: 100, left: 24, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
            {reactions.map((r) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(0,0,0,0.7)', borderRadius: 99, animation: 'fadeUp 0.3s ease both', fontSize: '0.85rem', backdropFilter: 'blur(8px)' }}>
                <span style={{ fontSize: '1.3rem' }}>{r.reaction}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.userName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="vr-sidebar">
            <ChatPanel
              messages={messages}
              onSend={handleSendMessage}
              onReaction={handleReaction}
              participants={participants}
            />
          </div>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
