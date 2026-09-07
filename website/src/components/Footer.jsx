import React from 'react';
import { 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  ShieldAlert, 
  Smartphone 
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
      {/* Top Banner: Mobile App Reminder */}
      <div className="footer-callout-strip">
        <div className="container footer-callout-container">
          <div className="callout-content">
            <div className="callout-icon-box">
              <Smartphone size={24} />
            </div>
            <div>
              <h4 className="callout-title">Ready to book a verified technician?</h4>
              <p className="callout-desc">
                Download the official <strong>FixLink Mobile App</strong> on Android & iOS to book repairs, track technicians live, and make secure payments.
              </p>
            </div>
          </div>
          <div className="callout-buttons">
            <button className="btn btn-white btn-sm" onClick={() => handleNav('services')}>
              <span>Browse Services</span>
            </button>
            <button className="btn btn-orange btn-sm" onClick={() => handleNav('how-it-works')}>
              <span>See How It Works</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container footer-main-container">
        <div className="footer-grid">
          {/* Column 1: Brand & Mission */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => handleNav('home')}>
              <div className="footer-logo-ring">
                <Wrench size={20} className="footer-wrench" />
              </div>
              <span className="footer-brand-name">
                <span className="name-fix">Fix</span>
                <span className="name-link">Link</span>
              </span>
            </div>
            
            <p className="footer-mission">
              Connecting Ethiopian households and businesses with verified, background-checked repair professionals. Fast, reliable, and fair pricing.
            </p>

            <div className="footer-tagline-badge">
              <span className="tag-connect">Connect.</span>
              <span className="tag-fix">Fix.</span>
              <span className="tag-done">Done.</span>
            </div>

            <div className="footer-security-note">
              <ShieldCheck size={16} className="security-icon" />
              <span>Kebele ID & Trade Certificate Verified Technicians</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('home')}>
                  Home
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  All Services
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
                  <span>Admin Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Repair Specialties */}
          <div className="footer-col">
            <h4 className="footer-heading">Core Categories</h4>
            <ul className="footer-links">
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Plumbing & Water Systems
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Electrical & Solar Power
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Appliances & Electronics
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Carpentry & Compound Gates
                </button>
              </li>
              <li>
                <button className="footer-link-btn" onClick={() => handleNav('services')}>
                  Finishing & Tile Repair
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Ethiopia Office & Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Addis Ababa Office</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>Bole Subcity, Cameroon Street, Addis Ababa, Ethiopia</span>
              </li>
              <li>
                <Phone size={18} className="contact-icon" />
                <a href="tel:+251913426886">+251 913 426 886 / +251 911 234 567</a>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <a href="mailto:support@fixlink.et">support@fixlink.et</a>
              </li>
              <li>
                <Clock size={18} className="contact-icon" />
                <span>Mon – Sat: 8:00 AM – 7:00 PM EAT</span>
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
