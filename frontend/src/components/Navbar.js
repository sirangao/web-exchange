import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">⟳</span>
          <span className="brand-text">Campus<strong>Exchange</strong></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Browse
          </Link>
          {user && (
            <>
              <Link to="/my-listings" className={`nav-link ${isActive('/my-listings') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                My Listings
              </Link>
              <Link to="/meetups" className={`nav-link ${isActive('/meetups') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                Meetups
              </Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/create-listing" className="btn btn-primary btn-sm">
                + List Item
              </Link>
              <div className="nav-user-menu">
                <button className="nav-user-btn" onClick={() => setMenuOpen(m => !m)}>
                  <span className="avatar">{user.username[0].toUpperCase()}</span>
                  <span className="username-short">{user.username}</span>
                  <span className="chevron">▾</span>
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <button onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(m => !m)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
