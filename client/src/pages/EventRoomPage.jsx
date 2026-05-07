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

function StreamTile({ stream, label, muted = false }) {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [forceMuted, setForceMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.srcObject = stream || null;
    video.muted = muted || forceMuted;

    const updateVideoState = () => {
      const hasLiveVideoTrack = stream?.getVideoTracks?.().some(
        (track) => track.readyState === 'live'
      );
      const hasFrame = video.videoWidth > 0;
      const ready = Boolean(hasLiveVideoTrack && hasFrame);

      if (!stream) {
        setVideoReady(false);
        return;
      }

      const playPromise = video.play();
      if (playPromise?.then) {
        playPromise
          .then(() => setVideoReady(ready))
          .catch(() => {
            if (!muted && !forceMuted) {
              setForceMuted(true);
            } else {
              setVideoReady(false);
            }
          });
      } else {
        setVideoReady(ready);
      }
    };

    updateVideoState();

    const tracks = stream?.getTracks?.() || [];
    tracks.forEach((track) => {
      track.addEventListener('mute', updateVideoState);
      track.addEventListener('unmute', updateVideoState);
      track.addEventListener('ended', updateVideoState);
    });

    stream?.addEventListener?.('addtrack', updateVideoState);
    stream?.addEventListener?.('removetrack', updateVideoState);
    video.addEventListener('loadedmetadata', updateVideoState);
    video.addEventListener('loadeddata', updateVideoState);
    video.addEventListener('canplay', updateVideoState);
    video.addEventListener('playing', updateVideoState);
    video.addEventListener('resize', updateVideoState);

    return () => {
      tracks.forEach((track) => {
        track.removeEventListener('mute', updateVideoState);
        track.removeEventListener('unmute', updateVideoState);
        track.removeEventListener('ended', updateVideoState);
      });

      stream?.removeEventListener?.('addtrack', updateVideoState);
      stream?.removeEventListener?.('removetrack', updateVideoState);
      video.removeEventListener('loadedmetadata', updateVideoState);
      video.removeEventListener('loadeddata', updateVideoState);
      video.removeEventListener('canplay', updateVideoState);
      video.removeEventListener('playing', updateVideoState);
      video.removeEventListener('resize', updateVideoState);
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [stream, muted, forceMuted]);

  return (
    <div className="participant-video" style={{ width: 220, aspectRatio: '16 / 10', borderRadius: 'var(--radius-lg)' }}>
      <video
        ref={videoRef}
        autoPlay
        muted={muted || forceMuted}
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: videoReady ? 1 : 0 }}
      />
      {!videoReady && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(39, 39, 42, 0.9)', color: 'var(--text-muted)', fontWeight: 700 }}>
          Connecting camera...
        </div>
      )}
      <div className="participant-label">{label}</div>
    </div>
  );
}

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
  const [mediaReady, setMediaReady] = useState(false);

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
    let active = true;
    setMediaReady(false);

    initLocalStream(true, true).finally(() => {
      if (active) setMediaReady(true);
    });

    return () => {
      active = false;
      cleanup();
    };
  }, [initLocalStream, cleanup]);

  // Socket room events
  useEffect(() => {
    if (!socket || !user || !event || !mediaReady) return;

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
      socket.emit('leave-room', { roomId: eventId });
    };
  }, [
    socket,
    user,
    event,
    eventId,
    mediaReady,
    createPeer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
  ]);

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

  const remoteStreamEntries = participants.map((participant) => ({
    socketId: participant.socketId,
    stream: remoteStreams[participant.socketId],
    userName: participant.userName || 'Participant',
  }));

  Object.entries(remoteStreams).forEach(([socketId, stream]) => {
    if (!remoteStreamEntries.some((entry) => entry.socketId === socketId)) {
      remoteStreamEntries.push({ socketId, stream, userName: 'Participant' });
    }
  });

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

          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 40, maxHeight: 'calc(100% - 150px)', overflowY: 'auto', pointerEvents: 'auto' }}>
            {localStream && <StreamTile stream={localStream} label={`${user?.name || 'You'} (You)`} muted />}
            {remoteStreamEntries.map(({ socketId, stream, userName }) => (
              <StreamTile key={socketId} stream={stream} label={userName} />
            ))}
          </div>

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
