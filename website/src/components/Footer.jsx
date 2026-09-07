import React from 'react';
import { 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert 
} from 'lucide-react';
import './Footer.css';

export default function Footer({ onNavigate, setActivePage, onOpenAdminModal }) {
  const currentYear = new Date().getFullYear();

  const handleNav = (page) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (setActivePage) {
      setActivePage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-main-container">
        <div className="footer-grid">
          {/* Column 1: Brand & Socials */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => handleNav('home')}>
              <div className="footer-logo-ring">
                <Wrench size={18} className="footer-wrench" />
              </div>
              <span className="footer-brand-name">
                <span className="name-fix">Fix</span>
                <span className="name-link">Link</span>
              </span>
            </div>
            
            <p className="footer-mission">
              Connecting Ethiopian households with verified, background-checked repair professionals. Fast, reliable, and fair upfront pricing.
            </p>

            {/* Social Media Links: Facebook, LinkedIn, X */}
            <div className="footer-social-links" aria-label="Social Media Links">
              <a 
                href="#" 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-btn facebook" 
                aria-label="Facebook"
                title="Follow FixLink on Facebook"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-btn linkedin" 
                aria-label="LinkedIn"
                title="Follow FixLink on LinkedIn"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              <a 
                href="#" 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-btn x-twitter" 
                aria-label="X (formerly Twitter)"
                title="Follow FixLink on X"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            <div className="footer-security-note">
              <ShieldCheck size={15} className="security-icon" />
              <span>Kebele ID & Trade Screened Pros</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links">
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('home')}>
                  Home
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Services
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('how-it-works')}>
                  How It Works
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('about')}>
                  About FixLink
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('contact')}>
                  Contact Support
                </button>
              </li>
              <li>
                <button 
                  className="footer-link-btn admin-link" 
                  onClick={onOpenAdminModal}
                >
                  <ShieldAlert size={14} />
                  <span>Admin Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Core Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Core Services</h4>
            <ul className="footer-links">
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Plumbing & Water Systems
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Electrical & Power
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Appliances & Electronics
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Carpentry & Metalwork
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Finishing & Tile Repair
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact & Help</h4>
            <ul className="footer-contact-list">
              <li>
                <Phone size={18} className="contact-icon" />
                <div>
                  <span className="contact-label-sub">Phone Support</span>
                  <a href="tel:+251913426886" className="contact-link">+251 913 426 886</a>
                </div>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <div>
                  <span className="contact-label-sub">Email Support</span>
                  <a href="mailto:support@fixlink.et" className="contact-link">support@fixlink.et</a>
                </div>
              </li>
              <li>
                <MapPin size={18} className="contact-icon" />
                <div>
                  <span className="contact-label-sub">Headquarters</span>
                  <span>Addis Ababa, Ethiopia</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {currentYear} FixLink Technologies PLC. All rights reserved. Ethiopia.
          </p>
          
          <div className="footer-meta-note">
            <span>Public Information Portal • Booking enabled via FixLink Mobile App</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
