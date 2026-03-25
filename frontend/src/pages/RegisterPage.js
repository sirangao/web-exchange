import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    username: '', password: '', email: '', phone: '', college: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon-lg">⟳</span>
          <h1>CampusExchange</h1>
        </div>
        <h2>Create account</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>Join your campus marketplace</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input placeholder="cool_student" value={form.username} onChange={set('username')} autoFocus />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" placeholder="Min. 6 chars" value={form.password} onChange={set('password')} />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label>College / University</label>
              <input placeholder="State University" value={form.college} onChange={set('college')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Join CampusExchange'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
