import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ListingCard from '../components/ListingCard';
import './MyListingsPage.css';

export default function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/listings/my')
      .then(r => setListings(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active   = listings.filter(l => l.status === 'available');
  const inactive = listings.filter(l => l.status !== 'available');

  if (loading) return <div className="spinner" />;

  return (
    <div className="my-listings-page page-enter">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Listings</h1>
            <p className="text-muted">{listings.length} total · {active.length} active</p>
          </div>
          <Link to="/create-listing" className="btn btn-primary">+ New Listing</Link>
        </div>

        {listings.length === 0 ? (
          <div className="empty-state">
            <h3>No listings yet</h3>
            <p>Start selling or exchanging items with your fellow students.</p>
            <Link to="/create-listing" className="btn btn-primary" style={{ marginTop: 16 }}>
              List your first item
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section>
                <h2 className="section-heading">Active</h2>
                <div className="listings-grid">
                  {active.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}
            {inactive.length > 0 && (
              <section className="mt-lg">
                <h2 className="section-heading muted">Closed</h2>
                <div className="listings-grid">
                  {inactive.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
