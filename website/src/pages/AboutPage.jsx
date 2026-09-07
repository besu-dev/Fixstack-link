import React from 'react';
import MobileAppBanner from '../components/MobileAppBanner';
import { 
  Target, 
  Eye, 
  HeartHandshake, 
  ShieldCheck, 
  Award, 
  Zap, 
  Users, 
  MapPin,
  ArrowRight
} from 'lucide-react';
import './AboutPage.css';

export default function AboutPage({ setActivePage }) {
  return (
    <div className="about-page">
      {/* Hero Header */}
      <section className="about-hero-header">
        <div className="container">
          <span className="section-tag">Our Story & Purpose</span>
          <h1 className="about-main-title">
            Empowering Ethiopian Households & Skilled Technicians
          </h1>
          <p className="about-hero-subtitle">
            FixLink is on a mission to modernize household repairs in Ethiopia—replacing uncertainty and street-corner searches with verified quality, digital trust, and transparent prices.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section about-mission-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mv-card mission-card">
              <div className="mv-icon-box blue">
                <Target size={32} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To make household maintenance stress-free and accessible across Ethiopia by creating a trusted bridge between families in need of urgent repairs and verified, skilled local tradespeople.
              </p>
              <div className="mv-highlight">
                <span>Direct, honest, and reliable home service delivery in Addis Ababa.</span>
              </div>
            </div>

            <div className="mv-card vision-card">
              <div className="mv-icon-box orange">
                <Eye size={32} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To become the premier home services infrastructure for East Africa—fostering dignity for blue-collar professions, accelerating digital adoption, and setting the gold standard for residential safety.
              </p>
              <div className="mv-highlight orange">
                <span>Formalizing domestic trades and empowering skilled Ethiopian youth.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Ethiopian Context & The Problem We Solve */}
      <section className="section about-story-section">
        <div className="container">
          <div className="story-layout">
            <div className="story-text-col">
              <span className="section-tag orange">The Challenge in Addis Ababa</span>
              <h2 className="story-title">Why We Created FixLink</h2>
              
              <p className="story-para">
                In Addis Ababa and Ethiopian cities, finding a trustworthy plumber, electrician, or appliance technician has historically been a gamble. Homeowners rely on word-of-mouth or look for informal handymen on road corners, facing unpredictable pricing, delayed arrivals, and no accountability when jobs go wrong.
              </p>

              <p className="story-para">
                At the same time, thousands of certified technicians, vocational graduates (TVET), and skilled artisans struggle to find consistent clients without spending exorbitant commission fees or waiting idle for days.
              </p>

              <p className="story-para">
                <strong>FixLink solves both sides of this equation.</strong> By digitizing the discovery, quotation, and verification process, we guarantee safety and fair market rates for families while providing technicians with dignified, consistent work.
              </p>

              <div className="story-points-row">
                <div className="story-point">
                  <ShieldCheck size={20} className="point-icon" />
                  <span>Kebele-screened providers</span>
                </div>
                <div className="story-point">
                  <Award size={20} className="point-icon" />
                  <span>Verified customer ratings</span>
                </div>
                <div className="story-point">
                  <Zap size={20} className="point-icon" />
                  <span>Rapid dispatch in subcities</span>
                </div>
              </div>
            </div>

            <div className="story-stats-card glass-panel">
              <h4 className="stats-box-heading">FixLink at a Glance</h4>
              
              <div className="stat-row">
                <span className="stat-number">10</span>
                <div className="stat-desc">
                  <strong>Addis Ababa Subcities</strong>
                  <span>Active coverage across the capital</span>
                </div>
              </div>

              <div className="stat-row">
                <span className="stat-number">500+</span>
                <div className="stat-desc">
                  <strong>Verified Technicians</strong>
                  <span>Plumbers, electricians, carpenters</span>
                </div>
              </div>

              <div className="stat-row">
                <span className="stat-number">4.9★</span>
                <div className="stat-desc">
                  <strong>Average Quality Rating</strong>
                  <span>Rated by Ethiopian homeowners</span>
                </div>
              </div>

              <div className="stat-row">
                <span className="stat-number">15 min</span>
                <div className="stat-desc">
                  <strong>Average Response Time</strong>
                  <span>Quick matching via mobile app</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section about-values-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">What Guides Us</span>
            <h2 className="section-title">Our Guiding Values</h2>
            <p className="section-description">
              Integrity, craftsmanship, and local community empowerment are the pillars of everything we do.
            </p>
          </div>

          <div className="values-grid">
            <div className="value-item-card">
              <div className="value-icon-box">
                <ShieldCheck size={24} />
              </div>
              <h4>Uncompromising Safety</h4>
              <p>We treat your home like our own. Comprehensive ID and background checks are non-negotiable prerequisites for every provider.</p>
            </div>

            <div className="value-item-card">
              <div className="value-icon-box">
                <HeartHandshake size={24} />
              </div>
              <h4>Fair Dignity for Labor</h4>
              <p>We champion local technicians, ensuring transparent bidding, prompt digital payouts, and real opportunity for professional growth.</p>
            </div>

            <div className="value-item-card">
              <div className="value-icon-box">
                <Award size={24} />
              </div>
              <h4>Craftsmanship & Quality</h4>
              <p>Repairs should last. We prioritize skilled diagnosis over quick patches, backing our community with dedicated dispute support.</p>
            </div>

            <div className="value-item-card">
              <div className="value-icon-box">
                <Users size={24} />
              </div>
              <h4>Community First</h4>
              <p>Built in Ethiopia, for Ethiopia. We continually adapt our technology to local languages, payment methods, and cultural customs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout */}
      <MobileAppBanner />
    </div>
  );
}
