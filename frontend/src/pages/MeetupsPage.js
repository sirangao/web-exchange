import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './MeetupsPage.css';

const STATUS_COLORS = {
  proposed:  'var(--accent)',
  confirmed: 'var(--sell)',
  cancelled: 'var(--danger)',
  completed: 'var(--text-muted)',
};

export default function MeetupsPage() {
  const { user }   = useAuth();
  const [meetups,  setMeetups]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get('/meetups/my')
      .then(r => setMeetups(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (meetupId, status) => {
    try {
      await api.put(`/meetups/${meetupId}/status`, { status });
      setMeetups(m => m.map(x => x.id === meetupId ? { ...x, status } : x));
      showToast(`Meetup marked as ${status}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const fmt = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const incoming = meetups.filter(m => m.sellerId === user?.id && m.status === 'proposed');
  const outgoing = meetups.filter(m => m.buyerId  === user?.id);
  const other    = meetups.filter(m => m.sellerId === user?.id && m.status !== 'proposed');

  if (loading) return <div className="spinner" />;

  const MeetupCard = ({ m, role }) => (
    <div className="meetup-card card">
      <div className="meetup-card-header">
        <div>
          <span className="meetup-listing-id">Listing #{m.listingId}</span>
          <div className="meetup-parties">
            {role === 'seller'
              ? <span>From <strong>@{m.buyerUsername}</strong></span>
              : <span>To <strong>@{m.sellerUsername}</strong></span>
            }
          </div>
        </div>
        <span className="meetup-status-dot" style={{ color: STATUS_COLORS[m.status] }}>
          ● {m.status}
        </span>
      </div>

      <div className="meetup-details">
        <div className="meetup-detail-row">
          <span className="detail-icon">📍</span>
          <span>{m.location}</span>
        </div>
        {m.proposedTime && (
          <div className="meetup-detail-row">
            <span className="detail-icon">🕐</span>
            <span>{fmt(m.proposedTime)}</span>
          </div>
        )}
        {m.notes && (
          <div className="meetup-detail-row">
            <span className="detail-icon">💬</span>
            <span className="meetup-notes">{m.notes}</span>
          </div>
        )}
      </div>

      {m.status === 'proposed' && role === 'seller' && (
        <div className="meetup-actions">
          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(m.id, 'confirmed')}>
            ✓ Confirm
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(m.id, 'cancelled')}>
            ✗ Decline
          </button>
        </div>
      )}

      {m.status === 'confirmed' && (
        <div className="meetup-actions">
          <button className="btn btn-outline btn-sm" onClick={() => updateStatus(m.id, 'completed')}>
            ✓ Mark Completed
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(m.id, 'cancelled')}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="meetups-page page-enter">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Meetups</h1>
            <p className="text-muted">Track your in-person exchange appointments</p>
          </div>
        </div>

        {meetups.length === 0 ? (
          <div className="empty-state">
            <h3>No meetups yet</h3>
            <p>When you propose or receive a meetup request, it'll show here.</p>
          </div>
        ) : (
          <>
            {incoming.length > 0 && (
              <section className="meetup-section">
                <h2 className="section-heading">
                  Incoming Requests
                  <span className="count-badge">{incoming.length}</span>
                </h2>
                <div className="meetups-grid">
                  {incoming.map(m => <MeetupCard key={m.id} m={m} role="seller" />)}
                </div>
              </section>
            )}

            {outgoing.length > 0 && (
              <section className="meetup-section">
                <h2 className="section-heading">My Proposals</h2>
                <div className="meetups-grid">
                  {outgoing.map(m => <MeetupCard key={m.id} m={m} role="buyer" />)}
                </div>
              </section>
            )}

            {other.length > 0 && (
              <section className="meetup-section">
                <h2 className="section-heading muted">Past</h2>
                <div className="meetups-grid">
                  {other.map(m => <MeetupCard key={m.id} m={m} role="seller" />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
    </div>
  );
}
