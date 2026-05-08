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
        {user?.role === 'ADMIN' && <span className="badge badge-pending">Admin</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
