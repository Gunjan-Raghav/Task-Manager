import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      // Show the specific error from the backend if available
      setError(err.response?.data?.error || err.response?.data?.message || 'Server error. Please make sure the backend is running and you restarted it.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {message && <div style={{ color: 'var(--success-color)', marginBottom: '16px', textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px' }}>{message}</div>}
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Remember your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
