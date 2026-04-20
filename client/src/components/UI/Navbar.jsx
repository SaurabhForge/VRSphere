import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiGrid, FiUser } from 'react-icons/fi';
import { MdVrpano } from 'react-icons/md';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        VRSphere
      </Link>

      <div className="navbar-links">
        <Link to="/dashboard">
          <button className="btn btn-secondary btn-sm">
            <FiGrid size={15} /> Events
          </button>
        </Link>

        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowMenu((p) => !p)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px' }}
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--primary)' }}
            />
            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </span>
          </button>

          {showMenu && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 200,
                padding: '8px',
                zIndex: 200,
                animation: 'fadeUp 0.2s var(--ease) both',
              }}
              onMouseLeave={() => setShowMenu(false)}
            >
              <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--glass-border)', marginBottom: 6 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8, borderRadius: 8 }}
              >
                <FiLogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
