import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

function Particle({ delay, duration, left, size, color }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        borderRadius: '50%',
        background: color,
        width: size,
        height: size,
        left: left,
        opacity: 0,
      }}
      animate={{
        y: ['100vh', '-20vh'],
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: 'linear',
        delay: delay,
      }}
    />
  );
}

const FEATURES = [
  { icon: '🥽', title: 'Immersive VR Rooms', desc: 'Step into stunning 3D environments — classroom, auditorium, or lounge — powered by WebXR.' },
  { icon: '📹', title: 'Live Video & Audio', desc: 'Peer-to-peer WebRTC video/audio streams directly inside the 3D space.' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Instant messaging and emoji reactions synchronized across all participants.' },
  { icon: '🖥️', title: 'Screen Sharing', desc: 'Share your screen inside the virtual room for presentations and demos.' },
  { icon: '🔑', title: 'Instant Join Codes', desc: 'Share a short code to let anyone join your room in seconds.' },
  { icon: '🌐', title: 'Browser-Native WebXR', desc: 'No plugins needed. Works in any modern browser; VR headsets supported via WebXR.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 70, damping: 15 },
  },
};

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Generate deterministic particles for rendering consistency
  const particles = Array.from({ length: 25 }, (_, i) => ({
    key: i,
    left: `${(i * 13) % 100}%`,
    duration: 8 + (i % 12),
    delay: (i % 8),
    size: 3 + (i % 5),
    color: i % 3 === 0 ? 'var(--accent)' : i % 2 === 0 ? 'var(--primary)' : '#e879f9',
  }));

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* ── Hero ── */}
      <section className="landing-hero" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
        </div>
        
        {particles.map((p) => <Particle key={p.key} {...p} />)}

        <motion.div 
          className="container" 
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, y: yHero, opacity: opacityHero }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
            <span className="badge badge-accent" style={{ fontSize: '0.85rem', padding: '8px 20px', letterSpacing: '0.1em' }}>
              ✨ WebXR · WebRTC · MERN Stack
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em' }}>
            Where Remote Meetings
            <br />
            <span className="gradient-text">Become Immersive Worlds</span>
          </motion.h1>

          <motion.p variants={itemVariants} style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text-muted)', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.8 }}>
            VRSphere transforms boring video calls into immersive 3D meeting rooms. 
            Meet in a virtual classroom, auditorium, or lounge — right in your browser.
          </motion.p>

          <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auth">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-lg">
                🚀 Get Started Free
              </motion.button>
            </Link>
            <Link to="/auth">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-secondary btn-lg">
                🔑 Join a Room
              </motion.button>
            </Link>
          </motion.div>

          {/* Preview card */}
          <motion.div variants={itemVariants} style={{ marginTop: 80, display: 'inline-block' }}>
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="glass" 
              style={{ borderRadius: 'var(--radius-xl)', padding: '8px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), var(--glow-primary)' }}
            >
              <div style={{ background: 'var(--surface-2)', borderRadius: 'calc(var(--radius-xl) - 4px)', width: 'min(720px, 90vw)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top center, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }} style={{ fontSize: '4.5rem', marginBottom: 16 }}>🥽</motion.div>
                  <p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', color: '#fff' }}>Virtual Classroom Preview</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 8 }}>3D room loads seamlessly on join</p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                    {['🎓 Classroom', '🎭 Auditorium', '☕ Lounge'].map(r => (
                      <span key={r} className="badge badge-primary" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)' }}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '120px 0', background: 'var(--bg)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ textAlign: 'center', marginBottom: 80 }}
          >
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: 20 }}>
              Everything you need for <span className="gradient-text">virtual presence</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: 600, margin: '0 auto' }}>
              Built on cutting-edge web standards. No downloads, no plugins.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {FEATURES.map((f, i) => (
              <motion.div 
                key={f.title} 
                className="card" 
                style={{ padding: 32, position: 'relative', overflow: 'hidden' }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 50 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 50%)', opacity: 0, transition: 'opacity 0.3s' }} className="hover-glow" />
                <div style={{ fontSize: '2.5rem', marginBottom: 20, textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12, color: '#fff' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section style={{ padding: '100px 0', textAlign: 'center', background: 'var(--bg-2)', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-50%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)', filter: 'blur(80px)' }} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 24 }}>Ready to enter the <span className="gradient-text">Sphere?</span></h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: '1.1rem' }}>Create your free account and host your first virtual event today.</p>
          <Link to="/auth">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary btn-lg" style={{ padding: '20px 40px', fontSize: '1.1rem' }}>
              Join VRSphere →
            </motion.button>
          </Link>
          <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', marginTop: 64, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Built with MERN · A-Frame · WebRTC · Socket.IO</p>
        </motion.div>
      </section>
    </div>
  );
}
