import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ListingDetailPage.css';

const PAYMENT_LABELS = { paypal: 'PayPal', venmo: 'Venmo', zelle: 'Zelle', cash: 'In-Person Cash' };
const CONDITION_LABEL = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };

export default function ListingDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [listing,  setListing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [meetup,   setMeetup]   = useState({ location: '', proposedTime: '', notes: '' });
  const [toast,    setToast]    = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showMeetupForm, setShowMeetupForm] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMeetupSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meetups', {
        listingId:    parseInt(id),
        sellerId:     listing.userId,
        location:     meetup.location,
        proposedTime: meetup.proposedTime || null,
        notes:        meetup.notes,
      });
      showToast('Meetup proposed! Check Meetups to track status.');
      setShowMeetupForm(false);
      setMeetup({ location: '', proposedTime: '', notes: '' });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to propose meetup', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/my-listings');
    } catch {
      showToast('Failed to delete', 'error');
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await api.put(`/listings/${id}`, { ...listing, status });
      setListing(prev => ({ ...prev, status }));
      showToast(`Marked as ${status}`);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  if (loading) return <div className="spinner" />;
  if (!listing) return null;

  const isOwner  = user?.id === listing.userId;
  const typeLabel = listing.listingType === 'both'     ? 'For Sale & Exchange'
                  : listing.listingType === 'exchange' ? 'Exchange Only'
                  : 'For Sale';

  return (
    <div className="detail-page page-enter">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="detail-layout">
          {/* Image */}
          <div className="detail-img-wrap">
            {listing.imageUrl
              ? <img src={listing.imageUrl} alt={listing.title} />
              : <div className="detail-img-placeholder">
                  <span>{listing.categoryName?.[0] || '📦'}</span>
                </div>
            }
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-tags">
              <span className={`badge badge-${listing.listingType}`}>{typeLabel}</span>
              <span className={`badge badge-${listing.status}`}>{listing.status}</span>
              {listing.categoryName && (
                <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text-muted)' }}>
                  {listing.categoryName}
                </span>
              )}
            </div>

            <h1 className="detail-title">{listing.title}</h1>

            {listing.price != null && listing.listingType !== 'exchange' && (
              <div className="detail-price">${parseFloat(listing.price).toFixed(2)}</div>
            )}

            {listing.conditionGrade && (
              <div className="detail-condition">
                Condition: <strong>{CONDITION_LABEL[listing.conditionGrade] || listing.conditionGrade}</strong>
              </div>
            )}

            {listing.description && (
              <p className="detail-description">{listing.description}</p>
            )}

            {/* Seller */}
            <div className="seller-card">
              <div className="seller-avatar">{listing.sellerUsername[0].toUpperCase()}</div>
              <div>
                <div className="seller-name">@{listing.sellerUsername}</div>
                <div className="seller-contact">
                  {listing.sellerEmail && <span>✉ {listing.sellerEmail}</span>}
                  {listing.sellerPhone && <span>📞 {listing.sellerPhone}</span>}
                </div>
              </div>
            </div>

            {/* Payment methods */}
            {listing.paymentMethods?.length > 0 && listing.listingType !== 'exchange' && (
              <div className="payment-section">
                <div className="section-label">Accepted Payment</div>
                <div className="payment-chips">
                  {listing.paymentMethods.map(m => (
                    <span key={m} className="payment-chip">{PAYMENT_LABELS[m] || m}</span>
                  ))}
                </div>
                <p className="payment-note">
                  ℹ Payment happens off-site. Contact the seller via the info above.
                </p>
              </div>
            )}

            {/* Actions */}
            {isOwner ? (
              <div className="owner-actions">
                <button className="btn btn-outline" onClick={() => navigate(`/edit-listing/${id}`)}>
                  Edit Listing
                </button>
                {listing.status === 'available' && (
                  <button className="btn btn-outline" onClick={() => handleStatusUpdate('sold')}>
                    Mark Sold
                  </button>
                )}
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            ) : (
              user && listing.status === 'available' && (
                <div className="buyer-actions">
                  <button className="btn btn-primary" onClick={() => setShowMeetupForm(s => !s)}>
                    {showMeetupForm ? 'Cancel' : '📍 Propose Meetup'}
                  </button>
                </div>
              )
            )}

            {/* Meetup form */}
            {showMeetupForm && (
              <form className="meetup-form" onSubmit={handleMeetupSubmit}>
                <h3>Propose a Meetup</h3>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    placeholder="e.g. Student Union Building Lobby"
                    value={meetup.location}
                    onChange={e => setMeetup(m => ({ ...m, location: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Proposed Date & Time</label>
                  <input
                    type="datetime-local"
                    value={meetup.proposedTime}
                    onChange={e => setMeetup(m => ({ ...m, proposedTime: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    placeholder="Any extra details for the seller…"
                    rows={3}
                    value={meetup.notes}
                    onChange={e => setMeetup(m => ({ ...m, notes: e.target.value }))}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Send Proposal</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.msg}</div>}
    </div>
  );
}
