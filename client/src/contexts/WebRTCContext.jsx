import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';

const WebRTCContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const WebRTCProvider = ({ children }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenStream, setScreenStream] = useState(null);

  const peersRef = useRef({}); // { socketId: RTCPeerConnection }
  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef({}); // { socketId: MediaStream }
  const pendingIceCandidatesRef = useRef({}); // { socketId: RTCIceCandidateInit[] }
  const socketRef = useRef(null);
  const roomIdRef = useRef(null);

  const flushPendingIceCandidates = useCallback(async (socketId, peer) => {
    const pending = pendingIceCandidatesRef.current[socketId] || [];
    if (!pending.length) return;

    pendingIceCandidatesRef.current[socketId] = [];
    for (const candidate of pending) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('ICE error', e);
      }
    }
  }, []);

  // ─── Initialize local media ─────────────────────────────────────
  const publishRemoteStream = useCallback((socketId) => {
    const stream = remoteStreamsRef.current[socketId];
    if (!stream) return;

    setRemoteStreams((prev) => ({
      ...prev,
      [socketId]: new MediaStream(stream.getTracks()),
    }));
  }, []);

  const initLocalStream = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('Media access denied, continuing without:', err.message);
      const emptyStream = new MediaStream();
      localStreamRef.current = emptyStream;
      setLocalStream(emptyStream);
      return emptyStream;
    }
  }, []);

  // ─── Create peer connection ──────────────────────────────────────
  const createPeer = useCallback((targetSocketId, socket, initiator) => {
    if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId];

    const peer = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });
    }

    if (!localStream?.getAudioTracks().length) {
      peer.addTransceiver('audio', { direction: 'recvonly' });
    }
    if (!localStream?.getVideoTracks().length) {
      peer.addTransceiver('video', { direction: 'recvonly' });
    }

    // ICE candidates
    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: e.candidate,
        });
      }
    };

    // Remote stream
    peer.ontrack = (e) => {
      if (!remoteStreamsRef.current[targetSocketId]) {
        remoteStreamsRef.current[targetSocketId] = new MediaStream();
      }

      const remoteStream = remoteStreamsRef.current[targetSocketId];
      const isNewTrack = !remoteStream.getTracks().some((track) => track.id === e.track.id);
      if (isNewTrack) {
        remoteStream.addTrack(e.track);

        const republish = () => publishRemoteStream(targetSocketId);
        e.track.addEventListener('mute', republish);
        e.track.addEventListener('unmute', republish);
        e.track.addEventListener('ended', () => {
          remoteStream.removeTrack(e.track);
          republish();
        });
      }
      publishRemoteStream(targetSocketId);
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
        delete remoteStreamsRef.current[targetSocketId];
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[targetSocketId];
          return next;
        });
      }
    };

    peersRef.current[targetSocketId] = peer;

    if (initiator) {
      peer
        .createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socket.emit('webrtc-offer', {
            targetSocketId,
            offer: peer.localDescription,
          });
        });
    }

    return peer;
  }, [publishRemoteStream]);

  // ─── Handle incoming offer ───────────────────────────────────────
  const handleOffer = useCallback(async ({ offer, fromSocketId, socket }) => {
    const peer = createPeer(fromSocketId, socket, false);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    await flushPendingIceCandidates(fromSocketId, peer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('webrtc-answer', { targetSocketId: fromSocketId, answer });
  }, [createPeer, flushPendingIceCandidates]);

  // ─── Handle incoming answer ──────────────────────────────────────
  const handleAnswer = useCallback(async ({ answer, fromSocketId }) => {
    const peer = peersRef.current[fromSocketId];
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingIceCandidates(fromSocketId, peer);
    }
  }, [flushPendingIceCandidates]);

  // ─── Handle ICE candidate ────────────────────────────────────────
  const handleIceCandidate = useCallback(async ({ candidate, fromSocketId }) => {
    const peer = peersRef.current[fromSocketId];
    if (!candidate) return;

    if (!peer || !peer.remoteDescription) {
      pendingIceCandidatesRef.current[fromSocketId] = [
        ...(pendingIceCandidatesRef.current[fromSocketId] || []),
        candidate,
      ];
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn('ICE error', e);
    }
  }, []);

  // ─── Remove peer ─────────────────────────────────────────────────
  const removePeer = useCallback((socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].close();
      delete peersRef.current[socketId];
    }
    delete remoteStreamsRef.current[socketId];
    delete pendingIceCandidatesRef.current[socketId];
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  // ─── Toggle audio ────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setAudioEnabled((prev) => !prev);
    }
  }, []);

  // ─── Toggle video ────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setVideoEnabled((prev) => !prev);
    }
  }, []);

  // ─── Screen share ────────────────────────────────────────────────
  const startScreenShare = useCallback(async (socket, roomId) => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(screen);
      const videoTrack = screen.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(videoTrack);
      });
      socket.emit('screen-share-start', { roomId });
      videoTrack.onended = () => stopScreenShare(socket, roomId);
      return screen;
    } catch (e) {
      console.warn('Screen share denied:', e.message);
    }
  }, []);

  const stopScreenShare = useCallback(async (socket, roomId) => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) sender.replaceTrack(videoTrack);
      });
    }
    socket?.emit('screen-share-stop', { roomId });
  }, [screenStream]);

  // ─── Cleanup ─────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    Object.values(peersRef.current).forEach((p) => p.close());
    peersRef.current = {};
    remoteStreamsRef.current = {};
    pendingIceCandidatesRef.current = {};
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams({});
    setScreenStream(null);
  }, []);

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        remoteStreams,
        audioEnabled,
        videoEnabled,
        screenStream,
        initLocalStream,
        createPeer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        removePeer,
        toggleAudio,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        cleanup,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => {
  const ctx = useContext(WebRTCContext);
  if (!ctx) throw new Error('useWebRTC must be used inside WebRTCProvider');
  return ctx;
};
