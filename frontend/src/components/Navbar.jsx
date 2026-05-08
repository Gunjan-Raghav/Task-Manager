import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">TaskManager</Link>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        {user?.role === 'ADMIN' && <span className="badge badge-in-progress" style={{ marginLeft: '-15px' }}>Admin</span>}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '10px', paddingLeft: '20px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{user?.role.toLowerCase()}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
