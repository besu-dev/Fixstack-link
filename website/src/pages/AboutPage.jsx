import React from 'react';
import MobileAppBanner from '../components/MobileAppBanner';
import { 
  Zap, 
  Droplets, 
  Tv, 
  Hammer, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';
import './AboutPage.css';

export default function AboutPage({ onNavigate, setActivePage }) {
  const handleExploreServices = () => {
    if (onNavigate) {
      onNavigate('services');
    } else if (setActivePage) {
      setActivePage('services');
    }
  };

  const serviceHighlights = [
    { label: 'Plumbing & Water Pumps', icon: Droplets },
    { label: 'Electrical Repairs', icon: Zap },
    { label: 'Appliance Repair', icon: Tv },
    { label: 'General Maintenance', icon: Hammer },
  ];

  return (
    <div className="about-page">
      <section className="about-minimal-section">
        <div className="container">
          <div className="about-layout-grid">
            {/* Left Content Column */}
            <div className="about-content-col">
              <div className="about-kicker-wrap">
                <span className="about-section-kicker">About FixLink</span>
              </div>
              
              <h2 className="about-tagline">
                Your home problems, solved by the right professionals.
              </h2>
              
              <div className="about-description">
                <p>
                  FixLink is a modern household service platform that connects Ethiopian families directly with certified, background-checked repair professionals.
                </p>
                <p>
                  From plumbing, water pumps, and electrical repairs to appliances and general maintenance, we eliminate the hassle of informal street searches with upfront pricing and verified workmanship.
                </p>
              </div>

              {/* Service Focus Chips */}
              <div className="about-services-chips" aria-label="Core Services">
                {serviceHighlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <span key={index} className="about-service-chip">
                      <Icon size={15} className="chip-icon" />
                      <span>{item.label}</span>
                    </span>
                  );
                })}
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
                  alt="Verified FixLink Repair Professional in Ethiopia" 
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
                    <span>Kebele ID & trade checked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Mobile App Callout */}
      <MobileAppBanner />
    </div>
  );
}
