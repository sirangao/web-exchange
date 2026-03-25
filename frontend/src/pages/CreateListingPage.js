import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import './CreateListingPage.css';

const CONDITIONS   = ['new', 'like_new', 'good', 'fair', 'poor'];
const COND_LABELS  = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };
const PAYMENT_OPTS = ['paypal', 'venmo', 'zelle', 'cash'];
const PAY_LABELS   = { paypal: 'PayPal', venmo: 'Venmo', zelle: 'Zelle', cash: 'Cash (In Person)' };

export default function CreateListingPage() {
  const { id }    = useParams();   // if present → edit mode
  const navigate  = useNavigate();
  const isEdit    = Boolean(id);

  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', listingType: 'sell',
    price: '', conditionGrade: 'good', paymentMethods: [],
  });
  const [categories, setCategories] = useState([]);
  const [image,      setImage]      = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      api.get(`/listings/${id}`).then(r => {
        const l = r.data;
        setForm({
          title:          l.title || '',
          description:    l.description || '',
          categoryId:     l.categoryId || '',
          listingType:    l.listingType || 'sell',
          price:          l.price != null ? String(l.price) : '',
          conditionGrade: l.conditionGrade || 'good',
          paymentMethods: l.paymentMethods || [],
          status:         l.status || 'available',
        });
        if (l.imageUrl) setPreview(l.imageUrl);
      }).catch(() => navigate('/'));
    }
  }, [id, isEdit, navigate]);

  const togglePayment = (method) => {
    setForm(f => ({
      ...f,
      paymentMethods: f.paymentMethods.includes(method)
        ? f.paymentMethods.filter(m => m !== method)
        : [...f.paymentMethods, method],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/listings/${id}`, form);
        navigate(`/listings/${id}`);
      } else {
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => {
          if (k === 'paymentMethods') data.append(k, v.join(','));
          else if (v !== '') data.append(k, v);
        });
        if (image) data.append('image', image);
        const res = await api.post('/listings', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        navigate(`/listings/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  const needsPrice = form.listingType === 'sell' || form.listingType === 'both';
  const needsPayment = needsPrice;

  return (
    <div className="create-page page-enter">
      <div className="container">
        <div className="create-header">
          <h1>{isEdit ? 'Edit Listing' : 'List an Item'}</h1>
          <p className="text-muted">{isEdit ? 'Update your listing details' : 'Sell or exchange your item with fellow students'}</p>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                placeholder="e.g. Calculus 8th Edition Textbook"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                maxLength={150}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe the item, any defects, edition, etc."
              rows={4}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Type selector */}
          <div className="form-group">
            <label>Listing Type *</label>
            <div className="type-selector">
              {[
                { value: 'sell',     label: 'For Sale',          desc: 'Set a price' },
                { value: 'exchange', label: 'Exchange',           desc: 'Trade for something' },
                { value: 'both',     label: 'Sell & Exchange',    desc: 'Either works' },
              ].map(t => (
                <button
                  type="button"
                  key={t.value}
                  className={`type-option ${form.listingType === t.value ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, listingType: t.value }))}
                >
                  <strong>{t.label}</strong>
                  <span>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            {needsPrice && (
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
            )}
            <div className="form-group">
              <label>Condition</label>
              <select value={form.conditionGrade} onChange={e => setForm(f => ({ ...f, conditionGrade: e.target.value }))}>
                {CONDITIONS.map(c => <option key={c} value={c}>{COND_LABELS[c]}</option>)}
              </select>
            </div>
          </div>

          {needsPayment && (
            <div className="form-group">
              <label>Accepted Payment Methods</label>
              <div className="payment-grid">
                {PAYMENT_OPTS.map(m => (
                  <label key={m} className={`pay-checkbox ${form.paymentMethods.includes(m) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.paymentMethods.includes(m)}
                      onChange={() => togglePayment(m)}
                    />
                    {PAY_LABELS[m]}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Image upload */}
          {!isEdit && (
            <div className="form-group">
              <label>Photo</label>
              <div className="image-upload" onClick={() => document.getElementById('img-input').click()}>
                {preview
                  ? <img src={preview} alt="preview" className="img-preview" />
                  : <div className="upload-placeholder">
                      <span>📷</span>
                      <span>Click to upload photo</span>
                    </div>
                }
              </div>
              <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>
          )}

          {isEdit && (
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="exchanged">Exchanged</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
