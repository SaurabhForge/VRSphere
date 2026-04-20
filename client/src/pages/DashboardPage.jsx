import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchEvents, deleteEvent, joinByCode } from '../services/api';
import EventCard from '../components/Dashboard/EventCard';
import CreateEventModal from '../components/Dashboard/CreateEventModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data } = await fetchEvents();
      setEvents(data.events || []);
    } catch (e) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      showToast('Event deleted', 'success');
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not delete event', 'error');
    }
  };

  const handleJoinCode = async () => {
    if (!codeInput.trim()) return;
    setCodeLoading(true);
    setCodError('');
    try {
      const { data } = await joinByCode(codeInput.trim());
      window.location.href = `/lobby/${data._id}`;
    } catch (e) {
      setCodError(e.response?.data?.message || 'Invalid code');
      setCodeLoading(false);
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
        
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          {/* Welcome */}
          <motion.div variants={itemVariants} style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '1.1rem' }}>Join or create an immersive virtual event below.</p>
          </motion.div>

          {/* Action row */}
          <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 48 }}>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary" 
              onClick={() => setShowCreate(true)}
            >
              ✨ Create Event
            </motion.button>

            <div style={{ display: 'flex', gap: 0, flex: 1, minWidth: 260, maxWidth: 400, position: 'relative' }}>
              <input
                className="form-input"
                placeholder="Join by code (e.g. A1B2C3D4)"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setCodError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinCode()}
                style={{ borderRadius: 'var(--radius) 0 0 var(--radius)', borderRight: 'none', paddingRight: '80px' }}
              />
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="btn btn-accent" 
                onClick={handleJoinCode} 
                disabled={codeLoading} 
                style={{ borderRadius: '0 var(--radius) var(--radius) 0', padding: '12px 24px' }}
              >
                {codeLoading ? '…' : '🔑 Join'}
              </motion.button>
            </div>
            {codeError && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', width: '100%', marginTop: -8 }}>{codeError}</p>}

            <input
              className="form-input"
              placeholder="🔍 Search events…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 300 }}
            />
          </motion.div>

          {/* Events grid */}
          {loading ? (
            <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <LoadingSpinner />
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div variants={itemVariants} style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <motion.p 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                style={{ fontSize: '4rem', marginBottom: 16 }}
              >
                🌐
              </motion.p>
              <h3 style={{ fontSize: '1.4rem', marginBottom: 8, color: '#fff', fontWeight: 600 }}>
                {search ? 'No matching events' : 'No events yet'}
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-faint)' }}>
                {search ? 'Try a different search term.' : 'Be the first to create one!'}
              </p>
              {!search && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn btn-primary" 
                  style={{ marginTop: 24 }} 
                  onClick={() => setShowCreate(true)}
                >
                  Create First Event
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}
            >
              <AnimatePresence>
                {filtered.map((event) => (
                  <motion.div 
                    key={event._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <EventCard event={event} onDelete={handleDelete} currentUserId={user?._id} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateEventModal
            onClose={() => setShowCreate(false)}
            onCreated={(e) => { setEvents((prev) => [e, ...prev]); showToast('Event created! 🎉', 'success'); }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="toast-container"
          >
            <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
