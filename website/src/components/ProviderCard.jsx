import React from 'react';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Smartphone,
  PhoneCall
} from 'lucide-react';
import './ProviderCard.css';

export default function ProviderCard({ provider, onShowAppNotice }) {
  // Generate pleasant avatar background from initials
  const initials = provider.fullName
    ? provider.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'FX';

  const ratingValue = provider.rating ? Number(provider.rating).toFixed(1) : '5.0';

  return (
    <div className={`provider-card ${provider.isFeatured ? 'featured' : ''}`}>
      {provider.isFeatured && (
        <div className="provider-featured-tag">
          <span>★ Featured Pro</span>
        </div>
      )}

      <div className="provider-top-row">
        {/* Avatar */}
        <div className="provider-avatar">
          {provider.avatarUrl ? (
            <img 
              src={provider.avatarUrl.startsWith('http') ? provider.avatarUrl : `http://localhost:5000${provider.avatarUrl}`} 
              alt={provider.fullName}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }} 
            />
          ) : null}
          <div className="avatar-fallback" style={{ display: provider.avatarUrl ? 'none' : 'flex' }}>
            {initials}
          </div>
          {provider.isAvailable && (
            <span className="online-indicator" title="Available for requests in Addis Ababa" />
          )}
        </div>

        {/* Name and Profession */}
        <div className="provider-meta">
          <div className="provider-name-wrap">
            <h4 className="provider-name">{provider.fullName}</h4>
            <span className="verified-badge-pill" title="Kebele ID & Trade Certificate Verified">
              <ShieldCheck size={14} />
              <span>Verified</span>
            </span>
          </div>
          <p className="provider-profession">{provider.profession || 'Repair Specialist'}</p>
          
          <div className="provider-location">
            <MapPin size={14} className="pin-icon" />
            <span>{provider.subcity ? `${provider.subcity} Subcity, Addis Ababa` : 'Addis Ababa'}</span>
          </div>
        </div>
      </div>

      {/* Ratings & Experience Row */}
      <div className="provider-stats-strip">
        <div className="stat-unit">
          <div className="rating-cluster">
            <Star size={15} fill="#F59E0B" color="#F59E0B" />
            <span className="rating-bold">{ratingValue}</span>
          </div>
          <span className="stat-label">Rating</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-unit">
          <span className="stat-value">{provider.experience || '2+ Years'}</span>
          <span className="stat-label">Experience</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-unit">
          <span className="stat-value text-success">
            {provider.isAvailable ? 'On Duty' : 'Available'}
          </span>
          <span className="stat-label">Status</span>
        </div>
      </div>

      {/* Skills Badges */}
      <div className="provider-skills-box">
        {provider.skills && provider.skills.length > 0 ? (
          provider.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="skill-chip">
              {skill}
            </span>
          ))
        ) : (
          <span className="skill-chip">{provider.profession || 'General Repair'}</span>
        )}
      </div>

      {/* Booking Notice in Card */}
      <div className="provider-action-footer">
        <button 
          className="provider-connect-btn"
          onClick={onShowAppNotice}
          title="Connect via FixLink Mobile App"
        >
          <Smartphone size={15} />
          <span>Connect via Mobile App</span>
        </button>
      </div>
    </div>
  );
}
