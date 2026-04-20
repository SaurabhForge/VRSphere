import React from 'react';

export default function LoadingSpinner({ fullPage = false, size = 40 }) {
  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          gap: '20px',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            border: '3px solid var(--glass-border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit', fontWeight: 600 }}>
          Loading VRSphere…
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid var(--glass-border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}
