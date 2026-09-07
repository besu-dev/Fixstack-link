import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero({ onExploreServices, onHowItWorks }) {
  return (
    <section className="hero-section">
      {/* Background Decorative Blobs */}
      <div className="hero-bg-blob blob-blue"></div>
      <div className="hero-bg-blob blob-orange"></div>
      <div className="hero-grid-pattern"></div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* Main Headline */}
          <h1 className="hero-title">
            Reliable Household Repairs in Ethiopia, <span className="text-gradient">Made Simple.</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subtitle">
            FixLink connects homeowners, tenants, and property managers with skilled local technicians for trusted household repairs. From plumbing and electrical work to appliance repairs and more, find the right professional to get the job done right.
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
        </div>
      </div>
    </section>
  );
}
