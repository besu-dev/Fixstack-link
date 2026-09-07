import React, { useState } from 'react';
import FlowTabs from '../components/FlowTabs';
import MobileAppBanner from '../components/MobileAppBanner';
import { 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  Smartphone, 
  CreditCard, 
  MapPin, 
  Lock,
  ArrowRight
} from 'lucide-react';
import './HowItWorksPage.css';

export default function HowItWorksPage({ setActivePage }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does FixLink verify technicians in Ethiopia?',
      a: 'Every technician registering on FixLink must submit their official Ethiopian Kebele ID card, verified phone number, trade certificates (if certified), and proof of experience. Our operations review team validates each credential before approving a provider to bid on jobs.'
    },
    {
      q: 'Can I book a repair technician directly from this website?',
      a: 'No. This public website is strictly informational. To ensure real-time technician matching, accurate GPS location in Addis Ababa, in-app chat, and transparent escrow payment protection, all bookings take place inside the FixLink Mobile Application.'
    },
    {
      q: 'Which subcities of Addis Ababa are currently supported?',
      a: 'FixLink covers all major subcities across Addis Ababa, including Bole, Yeka, Megenagna, Kirkos, Arada, Gullele, Lideta, Kolfe Keranio, Akaky Kaliti, and Nifas Silk-Lafto. We also serve expanding corridor districts.'
    },
    {
      q: 'How are payments handled for repairs?',
      a: 'Payments are processed securely via Ethiopian digital gateways like Chapa, Telebirr, and mobile banking. Customers pay only when the repair job has been diagnosed, completed, and approved.'
    },
    {
      q: 'What happens if I am not satisfied with the repair?',
      a: 'FixLink maintains a dedicated dispute resolution team. If a repair fails within the guaranteed period, you can flag the order in your mobile app history, and we will dispatch a senior technician or facilitate a resolution.'
    },
    {
      q: 'How do technicians receive job requests?',
      a: 'When a customer in your selected Addis Ababa subcity posts a job matching your skills (e.g. House Wiring or Pipe Leaks), you receive an immediate push notification on your phone. You can review photos, read problem notes, and submit your competitive bid.'
    }
  ];

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
          <FlowTabs onExploreServices={() => setActivePage('services')} />
        </div>
      </section>

      {/* Safety & Trust Pillars */}
      <section className="section hiw-safety-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Security & Trust First</span>
            <h2 className="section-title">Built on Accountability & Dignity</h2>
            <p className="section-description">
              Household repairs require inviting someone into your home. We hold every technician to strict standards so you can feel completely secure.
            </p>
          </div>

          <div className="safety-cards-grid">
            <div className="safety-card">
              <div className="safety-icon-box">
                <ShieldCheck size={28} />
              </div>
              <h4>Kebele ID Verification</h4>
              <p>Technicians verify their identity with national ID cards, address confirmation, and in-person document validation.</p>
            </div>

            <div className="safety-card">
              <div className="safety-icon-box">
                <CreditCard size={28} />
              </div>
              <h4>Transparent Bidding</h4>
              <p>No sudden price shocks. Technicians provide clear quotes based on the diagnosed issue before commencing physical work.</p>
            </div>

            <div className="safety-card">
              <div className="safety-icon-box">
                <Lock size={28} />
              </div>
              <h4>Job Completion Guarantee</h4>
              <p>Technicians are held accountable through customer ratings and reviews, ensuring high workmanship on every visit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section hiw-faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description">
              Everything you need to know about using FixLink, booking technicians, and provider registration.
            </p>
          </div>

          <div className="faq-accordion-wrap">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                  <button 
                    className="faq-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-question-text">{faq.q}</span>
                    <ChevronDown size={20} className={`faq-chevron ${isOpen ? 'rotated' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* App Callout */}
      <MobileAppBanner />
    </div>
  );
}
