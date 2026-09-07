import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import CategoryCard from '../components/CategoryCard';
import ProviderCard from '../components/ProviderCard';
import FlowTabs from '../components/FlowTabs';
import MobileAppBanner from '../components/MobileAppBanner';
import { 
  SERVICE_CATEGORIES, 
  fetchProviders 
} from '../api/services';
import { 
  ShieldCheck, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Wrench, 
  Users, 
  Check, 
  Smartphone,
  RefreshCw
} from 'lucide-react';
import './HomePage.css';

export default function HomePage({ setActivePage, onOpenAdminModal, onShowToast }) {
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoadingProviders(true);
      const res = await fetchProviders();
      if (isMounted) {
        setProviders(res.data);
        setIsLiveApi(res.isLive);
        setLoadingProviders(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSelectCategory = (catId) => {
    setActivePage('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAppNotice = () => {
    onShowToast('Booking & job orders are managed exclusively in the FixLink Mobile App. Download now!', 'info');
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <Hero 
        onExploreServices={() => setActivePage('services')}
        onHowItWorks={() => setActivePage('how-it-works')}
        totalProviders={providers.length}
        isBackendLive={isLiveApi}
      />

      {/* 2. Platform Value Props Banner */}
      <section className="value-props-section">
        <div className="container">
          <div className="value-props-grid">
            <div className="value-card">
              <div className="val-icon-ring blue">
                <ShieldCheck size={26} />
              </div>
              <div className="val-text">
                <h4>Verified Professionals</h4>
                <p>Every technician undergoes mandatory Ethiopian Kebele ID screening & trade certificate verification.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="val-icon-ring orange">
                <Smartphone size={26} />
              </div>
              <div className="val-text">
                <h4>Easy Mobile Requests</h4>
                <p>Post a repair job in under 60 seconds with clear photos and description on our intuitive mobile app.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="val-icon-ring sky">
                <Clock size={26} />
              </div>
              <div className="val-text">
                <h4>Rapid Local Dispatch</h4>
                <p>Connect with vetted technicians stationed nearby in your Addis Ababa subcity for fast arrival.</p>
              </div>
            </div>

            <div className="value-card">
              <div className="val-icon-ring green">
                <Award size={26} />
              </div>
              <div className="val-text">
                <h4>Transparent Ratings</h4>
                <p>View genuine ratings and reviews from local households before accepting any service bid.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Repair Services Section */}
      <section className="section popular-services-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Essential Home Maintenance</span>
            <h2 className="section-title">Popular Repair Services</h2>
            <p className="section-description">
              From emergency plumbing leaks to solar system installations, FixLink provides trusted specialists across all major household trades.
            </p>
          </div>

          <div className="categories-grid">
            {SERVICE_CATEGORIES.map((cat) => (
              <CategoryCard 
                key={cat.id} 
                category={cat} 
                onSelectCategory={handleSelectCategory}
              />
            ))}
          </div>

          <div className="section-footer-cta">
            <button 
              className="btn btn-outline btn-lg" 
              onClick={() => setActivePage('services')}
            >
              <span>Explore Complete Catalog (20+ Subskills)</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Dual Audience Section: Seekers vs Providers */}
      <section className="section dual-audience-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag orange">Built for Ethiopia</span>
            <h2 className="section-title">Designed for Both Households & Skilled Technicians</h2>
            <p className="section-description">
              FixLink transforms how home repairs work by empowering customers with reliability and technicians with dignity and steady income.
            </p>
          </div>

          <div className="dual-grid">
            {/* For Service Seekers */}
            <div className="audience-card seeker-card">
              <div className="audience-header">
                <div className="audience-icon-box blue">
                  <Users size={28} />
                </div>
                <div>
                  <span className="audience-role-tag">For Households & Businesses</span>
                  <h3 className="audience-title">Service Seekers</h3>
                </div>
              </div>

              <p className="audience-desc">
                No more relying on uncertain recommendations or overpaying unknown handymen. Get your home running smoothly with guaranteed peace of mind.
              </p>

              <ul className="audience-checklist">
                <li>
                  <Check size={18} className="check-bullet" />
                  <span><strong>Upfront Bids:</strong> Compare prices and provider reviews before hiring.</span>
                </li>
                <li>
                  <Check size={18} className="check-bullet" />
                  <span><strong>Safety First:</strong> Background-checked technicians with verified IDs.</span>
                </li>
                <li>
                  <Check size={18} className="check-bullet" />
                  <span><strong>Seamless Tracking:</strong> Real-time in-app status updates from diagnosis to fix.</span>
                </li>
                <li>
                  <Check size={18} className="check-bullet" />
                  <span><strong>Fair Dispute Protection:</strong> Operations team support on every completed order.</span>
                </li>
              </ul>

              <div className="audience-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => setActivePage('how-it-works')}
                >
                  <span>See How to Book via App</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* For Service Providers */}
            <div className="audience-card provider-card-banner">
              <div className="audience-header">
                <div className="audience-icon-box orange">
                  <Wrench size={28} />
                </div>
                <div>
                  <span className="audience-role-tag orange">For Skilled Technicians</span>
                  <h3 className="audience-title">Service Providers</h3>
                </div>
              </div>

              <p className="audience-desc">
                Take control of your trade. Connect directly with clients in your subcity, receive job notifications on your phone, and build a thriving reputation.
              </p>

              <ul className="audience-checklist">
                <li>
                  <Check size={18} className="check-bullet orange" />
                  <span><strong>Consistent Job Alerts:</strong> Get matched with repair tasks near you in Addis.</span>
                </li>
                <li>
                  <Check size={18} className="check-bullet orange" />
                  <span><strong>Set Your Rates:</strong> Submit bids based on the real scope of work.</span>
                </li>
                <li>
                  <Check size={18} className="check-bullet orange" />
                  <span><strong>Build Your Profile:</strong> Earn verified 5-star badges and client ratings.</span>
                </li>
                <li>
                  <Check size={18} className="check-bullet orange" />
                  <span><strong>Fast Payouts:</strong> Direct digital wallet & bank settlements via Chapa.</span>
                </li>
              </ul>

              <div className="audience-footer">
                <button 
                  className="btn btn-orange"
                  onClick={() => setActivePage('how-it-works')}
                >
                  <span>Technician Onboarding Guide</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Verified Technicians Showcase (Existing Backend Data) */}
      <section className="section live-providers-section">
        <div className="container">
          <div className="section-header">
            <div className="api-status-pill">
              <span className={`status-dot ${isLiveApi ? 'green' : 'amber'}`}></span>
              <span>{isLiveApi ? 'Connected to FixLink Backend Database' : 'Demonstration Database Preview'}</span>
            </div>
            <h2 className="section-title">Verified Technicians in Addis Ababa</h2>
            <p className="section-description">
              Browse real profiles of certified professionals registered on the FixLink network across Bole, Yeka, Megenagna, and other subcities.
            </p>
          </div>

          {loadingProviders ? (
            <div className="providers-loading-box">
              <RefreshCw className="spinner-icon" size={32} />
              <span>Fetching verified technicians from backend...</span>
            </div>
          ) : (
            <div className="providers-grid">
              {providers.slice(0, 4).map((provider) => (
                <ProviderCard 
                  key={provider._id} 
                  provider={provider} 
                  onShowAppNotice={handleAppNotice}
                />
              ))}
            </div>
          )}

          <div className="providers-note-box">
            <Smartphone size={20} className="note-icon" />
            <div className="note-text">
              <strong>Need to contact or hire one of these technicians?</strong>
              <p>Download the FixLink mobile app to submit a repair request and receive immediate bids from available providers.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setActivePage('how-it-works')}>
              <span>Learn How It Works</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. Quick How It Works Preview */}
      <section className="section how-it-works-preview-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple & Transparent</span>
            <h2 className="section-title">How FixLink Works</h2>
            <p className="section-description">
              Four streamlined steps from broken appliance to verified satisfaction.
            </p>
          </div>

          <FlowTabs onExploreServices={() => setActivePage('services')} />
        </div>
      </section>

      {/* 7. Mobile App Callout */}
      <MobileAppBanner />
    </div>
  );
}
