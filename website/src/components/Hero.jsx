import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Wrench, 
  Zap, 
  Smartphone,
  Check
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

        {/* Hero Visual Mockup */}
        <div className="hero-visual">
          <div className="hero-card-main glass-panel">
            {/* Top Bar of the Card */}
            <div className="card-top-bar">
              <div className="card-brand">
                <div className="card-logo-dot"></div>
                <span className="card-brand-text">FixLink Mobile Preview</span>
              </div>
              <span className="card-status-pill">
                <span className="status-indicator"></span> Verified Network
              </span>
            </div>

            {/* Simulated Mobile Card Content */}
            <div className="card-mockup-body">
              <div className="mockup-header-box">
                <div className="mockup-avatar">
                  <span>BG</span>
                </div>
                <div className="mockup-tech-info">
                  <div className="mockup-name-row">
                    <h4>Besu Geta</h4>
                    <span className="mockup-verified-tag">
                      <ShieldCheck size={12} /> Verified Pro
                    </span>
                  </div>
                  <p className="mockup-trade">Master Electrician & Solar Installer</p>
                  <div className="mockup-location-row">
                    <MapPin size={12} />
                    <span>Megenagna, Addis Ababa</span>
                    <div className="mockup-rating">
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span>4.9 (42 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mockup-skills-row">
                <span className="mockup-chip">⚡ House Wiring</span>
                <span className="mockup-chip">☀️ Solar System</span>
                <span className="mockup-chip">🔌 Breaker Repair</span>
              </div>

              {/* Live Request Banner */}
              <div className="mockup-active-job">
                <div className="active-job-header">
                  <span className="job-pulse-dot"></span>
                  <span className="job-label">Live Service Request in Bole</span>
                </div>
                <p className="job-desc">"Water heater trip repair & bathroom pipe check"</p>
                <div className="job-meta">
                  <span>Estimated Response: &lt; 15 mins</span>
                  <span className="job-price">Fair Standard Rate</span>
                </div>
              </div>

              {/* App Notice Banner */}
              <div className="mockup-app-download">
                <Smartphone size={20} className="app-icon" />
                <div className="app-text">
                  <span className="app-title">Download FixLink App</span>
                  <span className="app-sub">Available for Customers & Technicians</span>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="floating-badge badge-top-right animate-float">
              <div className="floating-icon-box orange">
                <Wrench size={16} />
              </div>
              <div>
                <strong>500+ Technicians</strong>
                <span>Addis Ababa Registered</span>
              </div>
            </div>

            <div className="floating-badge badge-bottom-left animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="floating-icon-box blue">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>100% Verified</strong>
                <span>Safety & Trade Screened</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
