import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import './Hero.css';

export default function Hero({ onExploreServices, onHowItWorks, totalProviders = 7, isBackendLive = false }) {
  return (
    <section className="hero-section">
      {/* Background Decorative Blobs */}
      <div className="hero-bg-blob blob-blue"></div>
      <div className="hero-bg-blob blob-orange"></div>
      <div className="hero-grid-pattern"></div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* Tagline Badge */}
          <div className="hero-tag-badge">
            <span className="ethiopia-flag">🇪🇹</span>
            <span className="tag-text">Ethiopia's Household Repair Platform</span>
            {isBackendLive && (
              <span className="live-pulse-badge">
                <span className="pulse-dot"></span> Live API Active
              </span>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            Reliable Household Repairs in Ethiopia, <span className="text-gradient">Solved with Confidence.</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subtitle">
            FixLink bridges Ethiopian homeowners, tenants, and property managers with verified, skilled local technicians. From burst water pipes in Bole to solar wiring in Megenagna—get repairs done right.
          </p>

          {/* Action CTAs */}
          <div className="hero-cta-group">
            <button 
              className="btn btn-primary btn-lg hero-btn"
              onClick={onExploreServices}
              id="hero-explore-btn"
            >
              <span>Explore Services</span>
              <ArrowRight size={18} />
            </button>
            <button 
              className="btn btn-outline btn-lg hero-btn"
              onClick={onHowItWorks}
              id="hero-how-it-works-btn"
            >
              <span>How It Works</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="hero-guarantees">
            <div className="guarantee-item">
              <CheckCircle2 size={18} className="guarantee-icon" />
              <span>Verified Kebele ID & Skills</span>
            </div>
            <div className="guarantee-item">
              <CheckCircle2 size={18} className="guarantee-icon" />
              <span>Addis Ababa Subcity Coverage</span>
            </div>
            <div className="guarantee-item">
              <CheckCircle2 size={18} className="guarantee-icon" />
              <span>Mobile-First Convenience</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
