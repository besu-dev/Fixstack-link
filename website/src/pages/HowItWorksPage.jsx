import React from 'react';
import FlowTabs from '../components/FlowTabs';
import MobileAppBanner from '../components/MobileAppBanner';
import './HowItWorksPage.css';

export default function HowItWorksPage({ onNavigate, setActivePage }) {
  return (
    <div className="how-it-works-page">
      {/* Hero Header */}
      <section className="hiw-header-section">
        <div className="container">
          <span className="section-tag orange">Clear & Transparent Process</span>
          <h1 className="hiw-main-title">How FixLink Works for Ethiopia</h1>
          <p className="hiw-subtitle">
            Whether you need a household emergency fixed fast or you are a skilled technician seeking reliable daily orders, FixLink makes the entire workflow seamless and secure.
          </p>
        </div>
      </section>

      {/* Main Flow Section */}
      <section className="section hiw-flow-section">
        <div className="container">
          <FlowTabs onExploreServices={() => (onNavigate ? onNavigate('services') : setActivePage && setActivePage('services'))} />
        </div>
      </section>

      {/* App Callout */}
      <MobileAppBanner />
    </div>
  );
}

