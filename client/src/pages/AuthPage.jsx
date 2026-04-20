import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Premium BG Glows */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.1), transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.1), transparent 50%)', filter: 'blur(80px)' }} />

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 70, damping: 20 }}
        className="card" 
        style={{ width: '100%', maxWidth: 440, padding: '48px 40px', position: 'relative', zIndex: 1, background: 'rgba(24, 24, 27, 0.5)', backdropFilter: 'blur(32px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg,var(--primary),var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>VRSphere</h1>
          </motion.div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 8 }}>{tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius)', padding: 6, marginBottom: 32, position: 'relative' }}>
          {['login', 'register'].map((t) => (
            <button 
              key={t} 
              onClick={() => { setTab(t); setError(''); }} 
              style={{ flex: 1, padding: '10px 0', borderRadius: 'calc(var(--radius) - 4px)', border: 'none', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', background: 'transparent', color: tab === t ? '#fff' : 'var(--text-muted)', position: 'relative', zIndex: 2 }}
            >
              {t === 'login' ? '🔐 Sign In' : '✨ Register'}
            </button>
          ))}
          <motion.div 
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ position: 'absolute', top: 6, bottom: 6, left: tab === 'login' ? 6 : '50%', right: tab === 'login' ? '50%' : 6, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', borderRadius: 'calc(var(--radius) - 4px)', zIndex: 1, boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)' }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginBottom: 24 }}
            >
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: '#fca5a5', fontSize: '0.9rem', fontWeight: 500 }}>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AnimatePresence mode="popLayout">
            {tab === 'register' && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="form-group"
              >
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} autoFocus={tab === 'login'} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} style={{ paddingRight: 48 }} />
              <button type="button" onClick={() => setShowPass((p) => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(139, 92, 246, 0.4)' }} 
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: 12, padding: '16px', justifyContent: 'center', fontSize: '1.05rem', letterSpacing: '0.02em' }} 
            disabled={loading}
          >
            {loading ? 'Please wait…' : tab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem', marginTop: 32 }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}>
            {tab === 'login' ? 'Register here' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
