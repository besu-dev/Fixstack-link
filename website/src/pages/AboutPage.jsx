import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage({ onNavigate, setActivePage }) {
  const handleExploreServices = () => {
    if (onNavigate) {
      onNavigate('services');
    } else if (setActivePage) {
      setActivePage('services');
    }
  };

  return (
    <div className="about-page">
      <section className="about-minimal-section">
        <div className="container">
          <div className="about-layout-grid">
            {/* Left Content Column */}
            <div className="about-content-col">
              <div className="about-kicker-wrap">
                <span className="about-section-kicker">About Bete</span>
              </div>
              
              <h2 className="about-tagline">
                Your home problems, solved by the right professionals.
              </h2>
              
              <div className="about-description">
                <p>
                  Bete is a modern household service platform that connects Ethiopian families directly with certified, background-checked repair professionals.
                </p>
                <p>
                  From plumbing, water pumps, and electrical repairs to appliances and general maintenance, we eliminate the hassle of informal street searches with upfront pricing and verified workmanship.
                </p>
              </div>

              {/* Action Button */}
              <div className="about-actions">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleExploreServices}
                >
                  <span>Explore Services</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Media Column */}
            <div className="about-media-col">
              <div className="about-image-wrapper">
                <img 
                  src="/images/about-technician.jpg" 
                  alt="Verified Bete Repair Professional in Ethiopia" 
                  className="about-image"
                  loading="lazy"
                />

                {/* Subtle Floating Trust Badge */}
                <div className="about-floating-badge">
                  <div className="floating-badge-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="floating-badge-text">
                    <strong>Verified Technicians</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

