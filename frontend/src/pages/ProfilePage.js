import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    college: user?.college || '',
  });
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaved(false);
    setLoading(true);
    try {
      await api.put('/auth/profile', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar-lg">{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h1>@{user?.username}</h1>
            <p className="text-muted">Member since {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
              : '—'
            }</p>
          </div>
        </div>

        <div className="profile-card card">
          <h2>Contact & Info</h2>
          <p className="text-muted" style={{ marginBottom: 24 }}>
            This information is shown to buyers / sellers on your listings.
          </p>

          {error  && <div className="form-error">{error}</div>}
          {saved  && <div className="form-success">✓ Profile updated!</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} />
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
