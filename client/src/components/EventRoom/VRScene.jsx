import React, { useEffect, useRef } from 'react';

const ROOM_CONFIGS = {
  classroom: {
    sky: '#0a0a1a',
    floor: { color: '#1a1a2e', width: 30, depth: 30 },
    walls: '#12122a',
    ambient: '#2233aa',
    lights: [
      { color: '#4455ff', position: '0 8 0', intensity: 0.8 },
      { color: '#7c3aed', position: '-8 6 -8', intensity: 0.5 },
    ],
    extras: `
      <!-- Blackboard -->
      <a-plane position="0 3.5 -12" width="10" height="4" color="#1a3a2a" roughness="0.9"></a-plane>
      <a-text value="Welcome to VRSphere" color="#ffffff" position="0 3.5 -11.9" align="center" width="8"></a-text>
      <!-- Projector Screen -->
      <a-plane position="0 5 -11.8" width="8" height="4.5" color="#e0e8ff" roughness="0.1" metalness="0.05"></a-plane>
      <!-- Desk rows -->
      <a-box position="-4 0.4 -5" width="3" height="0.1" depth="1.2" color="#2a1f4a"></a-box>
      <a-box position="0  0.4 -5" width="3" height="0.1" depth="1.2" color="#2a1f4a"></a-box>
      <a-box position="4  0.4 -5" width="3" height="0.1" depth="1.2" color="#2a1f4a"></a-box>
      <a-box position="-4 0.4 -2" width="3" height="0.1" depth="1.2" color="#2a1f4a"></a-box>
      <a-box position="0  0.4 -2" width="3" height="0.1" depth="1.2" color="#2a1f4a"></a-box>
      <a-box position="4  0.4 -2" width="3" height="0.1" depth="1.2" color="#2a1f4a"></a-box>
      <!-- Chairs -->
      <a-box position="-4 0.2 -4.2" width="0.6" height="0.08" depth="0.6" color="#3a2a5a"></a-box>
      <a-box position="0  0.2 -4.2" width="0.6" height="0.08" depth="0.6" color="#3a2a5a"></a-box>
      <a-box position="4  0.2 -4.2" width="0.6" height="0.08" depth="0.6" color="#3a2a5a"></a-box>
      <!-- Teacher podium -->
      <a-box position="0 0.6 -9" width="1.5" height="1.2" depth="0.8" color="#251535" roughness="0.8"></a-box>
      <!-- Floating particles -->
      <a-sphere position="-6 4 -6" radius="0.06" color="#7c3aed" opacity="0.7" animation="property: position; to: -6 5 -6; dur: 3000; dir: alternate; loop: true; easing: easeInOutSine"></a-sphere>
      <a-sphere position="6 3 -8"  radius="0.05" color="#00d4ff" opacity="0.6" animation="property: position; to: 6 4 -8; dur: 4000; dir: alternate; loop: true; easing: easeInOutSine"></a-sphere>
      <a-sphere position="0 6 -4"  radius="0.07" color="#7c3aed" opacity="0.5" animation="property: position; to: 0 7 -4; dur: 2500; dir: alternate; loop: true; easing: easeInOutSine"></a-sphere>
    `,
  },
  auditorium: {
    sky: '#050510',
    floor: { color: '#0d0d1a', width: 40, depth: 40 },
    walls: '#0a0a18',
    ambient: '#110022',
    lights: [
      { color: '#00d4ff', position: '0 12 0', intensity: 1.0 },
      { color: '#ff44aa', position: '-10 8 -10', intensity: 0.4 },
    ],
    extras: `
      <!-- Stage -->
      <a-box position="0 0.3 -14" width="16" height="0.6" depth="6" color="#111133" roughness="0.6"></a-box>
      <!-- Stage curtains -->
      <a-plane position="-9 4 -14" width="2" height="8" color="#3a0050" roughness="1" rotation="0 90 0"></a-plane>
      <a-plane position="9  4 -14" width="2" height="8" color="#3a0050" roughness="1" rotation="0 -90 0"></a-plane>
      <!-- Big screen -->
      <a-plane position="0 6 -16" width="14" height="7" color="#dde8ff" roughness="0.05" metalness="0.1"></a-plane>
      <!-- Tiered seating rows -->
      <a-box position="0 0.1  -4" width="18" height="0.25" depth="2" color="#1a1a2e"></a-box>
      <a-box position="0 0.5  -2" width="18" height="0.25" depth="2" color="#1a1a2e"></a-box>
      <a-box position="0 0.9   0" width="18" height="0.25" depth="2" color="#1a1a2e"></a-box>
      <a-box position="0 1.3   2" width="18" height="0.25" depth="2" color="#1a1a2e"></a-box>
      <!-- Spotlight -->
      <a-light type="spot" color="#ffffff" position="0 12 -10" target="[spotlight-target]" intensity="1.5" angle="30"></a-light>
      <a-entity id="spotlight-target" position="0 0 -14"></a-entity>
      <!-- Ambient stars -->
      <a-sphere position="-8 9 -12" radius="0.08" color="#00d4ff" opacity="0.8" animation="property: scale; to: 1.5 1.5 1.5; dur: 2000; dir: alternate; loop: true"></a-sphere>
      <a-sphere position="8  9 -12" radius="0.08" color="#ff44aa" opacity="0.8" animation="property: scale; to: 1.5 1.5 1.5; dur: 2500; dir: alternate; loop: true"></a-sphere>
    `,
  },
  lounge: {
    sky: '#080810',
    floor: { color: '#141420', width: 20, depth: 20 },
    walls: '#100f1e',
    ambient: '#221122',
    lights: [
      { color: '#ffaa44', position: '0 4 0', intensity: 0.7 },
      { color: '#aa44ff', position: '-5 3 -5', intensity: 0.4 },
      { color: '#44ffaa', position: '5 3 5',  intensity: 0.3 },
    ],
    extras: `
      <!-- Circular couch -->
      <a-torus position="0 0.5 0" radius="3" radius-tubular="0.4" color="#2a1535" roughness="0.9" rotation="-90 0 0"></a-torus>
      <!-- Coffee table -->
      <a-cylinder position="0 0.4 0" radius="1.2" height="0.08" color="#1a1025" roughness="0.6" metalness="0.3"></a-cylinder>
      <!-- Table glow -->
      <a-light type="point" color="#aa44ff" position="0 0.6 0" intensity="0.5" distance="3"></a-light>
      <!-- Ambient lamp 1 -->
      <a-cylinder position="-5 0 -5" radius="0.08" height="2.5" color="#3a2a1a"></a-cylinder>
      <a-sphere position="-5 2.8 -5" radius="0.3" color="#ffddaa" opacity="0.9" animation="property: light.intensity; to: 0.8; dur: 2000; dir: alternate; loop: true"></a-sphere>
      <a-light type="point" color="#ffaa44" position="-5 2.8 -5" intensity="0.6" distance="5"></a-light>
      <!-- Ambient lamp 2 -->
      <a-cylinder position="5 0 5" radius="0.08" height="2.5" color="#3a2a1a"></a-cylinder>
      <a-sphere position="5 2.8 5" radius="0.3" color="#ffddaa" opacity="0.9" animation="property: light.intensity; to: 0.6; dur: 3000; dir: alternate; loop: true"></a-sphere>
      <a-light type="point" color="#ffaa44" position="5 2.8 5" intensity="0.5" distance="5"></a-light>
      <!-- Floating orbs -->
      <a-sphere position="-2 3 -2" radius="0.15" color="#aa44ff" opacity="0.5" animation="property: position; to: -2 4 -2; dur: 5000; dir: alternate; loop: true; easing: easeInOutSine"></a-sphere>
      <a-sphere position="2 2.5 2"  radius="0.12" color="#44ffaa" opacity="0.4" animation="property: position; to: 2 3.5 2; dur: 4000; dir: alternate; loop: true; easing: easeInOutSine"></a-sphere>
    `,
  },
};

function buildAvatarEntities(participants) {
  return participants
    .map((p, i) => {
      const angle = (i / Math.max(participants.length, 1)) * Math.PI * 2;
      const radius = 3;
      const x = (radius * Math.cos(angle)).toFixed(2);
      const z = (radius * Math.sin(angle) - 5).toFixed(2);
      return `
        <a-entity position="${x} 1.6 ${z}">
          <!-- Avatar body -->
          <a-cylinder height="1.4" radius="0.25" color="#4a3a8a" roughness="0.8" position="0 -0.7 0"></a-cylinder>
          <!-- Avatar head -->
          <a-sphere radius="0.3" color="#f0d0b0" position="0 0 0"></a-sphere>
          <!-- Name label -->
          <a-text value="${p.userName || 'Guest'}" position="0 0.6 0" align="center" width="3" color="#ffffff" scale="0.8 0.8 0.8"></a-text>
          <!-- Pulse ring -->
          <a-torus position="0 0 0" radius="0.38" radius-tubular="0.02" color="#7c3aed" opacity="0.7"
            animation="property: scale; to: 1.3 1.3 1.3; dur: 1500; dir: alternate; loop: true; easing: easeInOutSine">
          </a-torus>
        </a-entity>
      `;
    })
    .join('');
}

export default function VRScene({ roomType = 'classroom', participants = [], localUser = null }) {
  const sceneRef = useRef(null);
  const cfg = ROOM_CONFIGS[roomType] || ROOM_CONFIGS.classroom;

  useEffect(() => {
    const handleEnterVR = () => console.log('Entered VR mode');
    const scene = sceneRef.current;
    if (scene) scene.addEventListener('enter-vr', handleEnterVR);
    return () => { if (scene) scene.removeEventListener('enter-vr', handleEnterVR); };
  }, []);

  const allParticipants = localUser
    ? [{ socketId: 'local', userName: `${localUser.name} (You)` }, ...participants]
    : participants;

  const avatarHTML = buildAvatarEntities(allParticipants);

  const lightsHTML = cfg.lights
    .map(
      (l) =>
        `<a-light type="point" color="${l.color}" position="${l.position}" intensity="${l.intensity}" distance="20"></a-light>`
    )
    .join('\n');

  const sceneHTML = `
    <a-sky color="${cfg.sky}"></a-sky>
    <a-plane position="0 0 0" rotation="-90 0 0" width="${cfg.floor.width}" height="${cfg.floor.depth}" color="${cfg.floor.color}" roughness="0.9" metalness="0.1"></a-plane>

    <!-- Walls -->
    <a-plane position="0 5 -${cfg.floor.depth / 2}" width="${cfg.floor.width}" height="10" color="${cfg.walls}" roughness="1"></a-plane>
    <a-plane position="0 5 ${cfg.floor.depth / 2}" width="${cfg.floor.width}" height="10" color="${cfg.walls}" rotation="0 180 0" roughness="1"></a-plane>
    <a-plane position="-${cfg.floor.width / 2} 5 0" width="${cfg.floor.depth}" height="10" color="${cfg.walls}" rotation="0 90 0" roughness="1"></a-plane>
    <a-plane position="${cfg.floor.width / 2} 5 0"  width="${cfg.floor.depth}" height="10" color="${cfg.walls}" rotation="0 -90 0" roughness="1"></a-plane>
    <a-plane position="0 10 0" rotation="90 0 0" width="${cfg.floor.width}" height="${cfg.floor.depth}" color="${cfg.walls}" roughness="1"></a-plane>

    <!-- Lighting -->
    <a-light type="ambient" color="${cfg.ambient}" intensity="0.4"></a-light>
    ${lightsHTML}

    <!-- Room Extras -->
    ${cfg.extras}

    <!-- Grid floor lines -->
    <a-entity>
      ${Array.from({ length: 7 }, (_, i) => {
        const pos = (i - 3) * 4;
        return `
          <a-plane position="${pos} 0.01 0" rotation="-90 0 0" width="0.02" height="${cfg.floor.depth}" color="#ffffff" opacity="0.04"></a-plane>
          <a-plane position="0 0.01 ${pos}" rotation="-90 0 0" width="${cfg.floor.width}" height="0.02" color="#ffffff" opacity="0.04"></a-plane>
        `;
      }).join('')}
    </a-entity>

    <!-- Avatars -->
    ${avatarHTML}

    <!-- Camera rig -->
    <a-entity id="rig" position="0 0 4">
      <a-camera wasd-controls look-controls>
        <a-cursor color="#7c3aed" fuse="false" raycaster="objects: .clickable"></a-cursor>
      </a-camera>
    </a-entity>
  `;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <a-scene
        ref={sceneRef}
        embedded
        renderer="colorManagement: true; physicallyCorrectLights: true;"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        dangerouslySetInnerHTML={{ __html: sceneHTML }}
        vr-mode-ui="enabled: true"
        loading-screen="dotsColor: #7c3aed; backgroundColor: #0a0a14"
      />

      {/* VR Hint overlay */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        padding: '8px 14px',
        background: 'rgba(0,0,0,0.6)',
        borderRadius: 'var(--radius)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--glass-border)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        pointerEvents: 'none',
      }}>
        🖱️ Mouse to look · WASD to move · Click VR button for headset
      </div>
    </div>
  );
}
