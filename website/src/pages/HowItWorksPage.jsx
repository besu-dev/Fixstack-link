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
          <h1 className="hiw-main-title">How Bete Works</h1>
          <p className="hiw-subtitle">
            Whether you need a quick household repair or you are a skilled technician looking for more jobs, Bete makes it easy to connect, request, and complete services.
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

