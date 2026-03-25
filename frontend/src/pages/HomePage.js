import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import ListingCard from '../components/ListingCard';
import './HomePage.css';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'sell', label: 'For Sale' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'both', label: 'Sell & Exchange' },
];

export default function HomePage() {
  const [listings,   setListings]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [type,       setType]       = useState('');
  const [category,   setCategory]   = useState('');
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (type)     params.type     = type;
    if (category) params.category = category;
    api.get('/listings', { params })
      .then(r => setListings(r.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [type, category]);

  const filtered = listings.filter(l =>
    search === '' ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    (l.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page page-enter">
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1>Buy. Sell. <span className="hero-accent">Exchange.</span></h1>
          <p className="hero-sub">The campus marketplace built for college students.</p>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for textbooks, electronics, furniture…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="filters-bar">
          <div className="type-tabs">
            {TYPES.map(t => (
              <button
                key={t.value}
                className={`type-tab ${type === t.value ? 'active' : ''}`}
                onClick={() => setType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="category-filter">
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results header */}
        <div className="results-header">
          <span className="results-count">
            {loading ? '…' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No listings found</h3>
            <p>Try adjusting your filters or be the first to list something!</p>
          </div>
        ) : (
          <div className="listings-grid">
            {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
