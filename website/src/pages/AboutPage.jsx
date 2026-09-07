import React from 'react';
import MobileAppBanner from '../components/MobileAppBanner';
import { 
  Target, 
  Eye, 
  ShieldCheck, 
  Award, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Smartphone,
  TrendingUp
} from 'lucide-react';
import './AboutPage.css';

export default function AboutPage({ onNavigate, setActivePage }) {
  const stats = [
    {
      number: '10',
      label: 'Addis Subcities',
      subtext: 'Bole, Yeka, Kirkos, Arada & more',
    },
    {
      number: '500+',
      label: 'Verified Technicians',
      subtext: 'Plumbing, electrical & appliance pros',
    },
    {
      number: '4.9★',
      label: 'Quality Rating',
      subtext: 'Rated by Ethiopian homeowners',
    },
    {
      number: '15 min',
      label: 'Rapid Matching',
      subtext: 'Quick dispatch via mobile app',
    },
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Vetted & Verified Providers',
      desc: 'National Kebele ID screening, verified phone numbers, and trade certificate validation before any provider can bid.',
      badge: 'Safety First',
      color: 'blue',
    },
    {
      icon: Award,
      title: 'Transparent Competitive Bidding',
      desc: 'No arbitrary price surprises. Technicians inspect problem photos and submit clear bids before beginning work.',
      badge: 'Zero Hidden Fees',
      color: 'orange',
    },
    {
      icon: Smartphone,
      title: 'Built for Ethiopia',
      desc: 'Seamless integration with local digital payments (Telebirr & Chapa), in-app chat, and GPS navigation in Addis Ababa.',
      badge: 'Local Innovation',
      color: 'teal',
    },
  ];

  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="about-hero-header">
        <div className="container">
          <div className="about-badge">
            <Sparkles size={15} className="about-badge-icon" />
            <span>About FixLink</span>
          </div>
          <h1 className="about-main-title">
            Reimagining Home Maintenance for Ethiopia
          </h1>
          <p className="about-hero-subtitle">
            FixLink bridges the gap between Ethiopian households in need of urgent repairs and verified, skilled technicians — bringing trust, transparency, and dignity to everyday services.
          </p>
        </div>
      </section>

      {/* Bento-Style Story & Metrics Grid */}
      <section className="about-bento-section">
        <div className="container">
          <div className="about-bento-grid">
            
            {/* Bento Card 1: The Problem & Our Story (Large Span 7) */}
            <div className="bento-card bento-story-card">
              <div className="bento-card-header">
                <span className="bento-tag orange">The Challenge & The Solution</span>
                <h2 className="bento-card-title">Why We Built FixLink</h2>
              </div>

              <div className="bento-story-body">
                <p>
                  In Addis Ababa, finding a reliable plumber, electrician, or appliance technician has traditionally been a gamble. Homeowners often relied on informal street-corner searches or haphazard word-of-mouth — leading to uncertain pricing, delayed arrivals, and zero accountability when repairs went wrong.
                </p>
                <p>
                  At the same time, thousands of certified vocational graduates (TVET) and skilled local artisans struggled to connect with clients without paying exorbitant commissions or waiting idle for days.
                </p>
              </div>

              <div className="bento-highlight-banner">
                <p>
                  <strong>FixLink solves both sides:</strong> We provide families with fast, background-checked technicians while equipping skilled tradespeople with dignified, consistent income.
                </p>
              </div>

              <div className="bento-tags-row">
                <span className="bento-pill">
                  <CheckCircle2 size={14} className="pill-check" /> Kebele-Screened Providers
                </span>
                <span className="bento-pill">
                  <CheckCircle2 size={14} className="pill-check" /> TVET & Vocational Trades
                </span>
                <span className="bento-pill">
                  <CheckCircle2 size={14} className="pill-check" /> Escrow & Dispute Protection
                </span>
              </div>
            </div>

            {/* Bento Card 2: Impact Metrics (Span 5) */}
            <div className="bento-card bento-metrics-card">
              <div className="bento-card-header">
                <span className="bento-tag blue">Platform Impact</span>
                <h3 className="bento-card-title">FixLink at a Glance</h3>
              </div>

              <div className="metrics-2x2-grid">
                {stats.map((stat, idx) => (
                  <div key={idx} className="metric-cell">
                    <div className="metric-number-wrap">
                      <span className="metric-number">{stat.number}</span>
                    </div>
                    <strong className="metric-label">{stat.label}</strong>
                    <span className="metric-subtext">{stat.subtext}</span>
                  </div>
                ))}
              </div>

              <div className="metrics-footer-note">
                <MapPin size={16} className="metric-pin-icon" />
                <span>Actively serving all 10 subcities across Addis Ababa</span>
              </div>
            </div>

            {/* Bento Card 3: Our Mission (Span 6) */}
            <div className="bento-card bento-mission-card">
              <div className="mv-card-icon-box blue">
                <Target size={28} />
              </div>
              <span className="mv-mini-tag">Our Core Mission</span>
              <h3 className="mv-card-heading">Empowering Households with Trust</h3>
              <p className="mv-card-desc">
                To make household repairs fast, predictable, and stress-free across Ethiopia by creating a trusted digital gateway between homeowners and verified local tradespeople.
              </p>
              <div className="mv-bottom-strip blue">
                <span>Safe, direct, and honest home service delivery in Addis Ababa.</span>
              </div>
            </div>

            {/* Bento Card 4: Our Vision (Span 6) */}
            <div className="bento-card bento-vision-card">
              <div className="mv-card-icon-box orange">
                <Eye size={28} />
              </div>
              <span className="mv-mini-tag orange">Our Long-term Vision</span>
              <h3 className="mv-card-heading">Dignity for Ethiopian Skilled Trades</h3>
              <p className="mv-card-desc">
                To become the premier home services infrastructure for East Africa — elevating blue-collar professions, accelerating digital adoption, and setting the benchmark for residential safety.
              </p>
              <div className="mv-bottom-strip orange">
                <span>Formalizing domestic trades and empowering vocational youth.</span>
              </div>
            </div>

            {/* Bento Card 5: The FixLink Difference / 3 Pillars (Span 12) */}
            <div className="bento-card bento-pillars-card">
              <div className="pillars-header">
                <div className="pillars-header-text">
                  <span className="bento-tag teal">The FixLink Standard</span>
                  <h3 className="pillars-title">How FixLink Protects You on Every Repair</h3>
                </div>
              </div>

              <div className="pillars-grid">
                {pillars.map((pillar, index) => {
                  const IconComponent = pillar.icon;
                  return (
                    <div key={index} className={`pillar-item pillar-${pillar.color}`}>
                      <div className="pillar-top">
                        <div className={`pillar-icon-box ${pillar.color}`}>
                          <IconComponent size={24} />
                        </div>
                        <span className={`pillar-badge ${pillar.color}`}>{pillar.badge}</span>
                      </div>
                      <h4 className="pillar-heading">{pillar.title}</h4>
                      <p className="pillar-desc">{pillar.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* App Callout Banner */}
      <MobileAppBanner />
    </div>
  );
}
