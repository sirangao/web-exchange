import React from 'react';
import { Link } from 'react-router-dom';
import './ListingCard.css';

const PAYMENT_ICONS = { paypal: '🅿', venmo: '💙', zelle: '⚡', cash: '💵' };
const CONDITION_LABEL = { new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor' };

export default function ListingCard({ listing }) {
  const { id, title, price, listingType, conditionGrade, status,
          categoryName, imageUrl, sellerUsername, paymentMethods, createdAt } = listing;

  const typeLabel = listingType === 'both' ? 'Sell & Exchange' :
                    listingType === 'exchange' ? 'Exchange' : 'For Sale';

  const daysAgo = () => {
    const diff = Math.floor((Date.now() - new Date(createdAt)) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  };

  return (
    <Link to={`/listings/${id}`} className="listing-card card">
      <div className="card-img-wrap">
        {imageUrl
          ? <img src={imageUrl} alt={title} className="card-img" />
          : <div className="card-img-placeholder">
              <span>{categoryName?.[0] || '?'}</span>
            </div>
        }
        <span className={`badge badge-${listingType} card-type-badge`}>{typeLabel}</span>
        {status !== 'available' && (
          <div className="card-status-overlay">{status.toUpperCase()}</div>
        )}
      </div>

      <div className="card-body">
        <div className="card-header-row">
          {categoryName && <span className="card-category">{categoryName}</span>}
          <span className="card-age">{daysAgo()}</span>
        </div>

        <h3 className="card-title">{title}</h3>

        <div className="card-meta">
          {conditionGrade && (
            <span className="condition-pill">{CONDITION_LABEL[conditionGrade] || conditionGrade}</span>
          )}
          {price != null && listingType !== 'exchange' && (
            <span className="card-price">${parseFloat(price).toFixed(2)}</span>
          )}
          {listingType === 'exchange' && (
            <span className="card-price exchange-tag">Trade Only</span>
          )}
        </div>

        <div className="card-footer">
          <span className="card-seller">@{sellerUsername}</span>
          {paymentMethods?.length > 0 && (
            <span className="payment-icons">
              {paymentMethods.map(m => (
                <span key={m} title={m} className="pay-icon">{PAYMENT_ICONS[m] || m}</span>
              ))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
