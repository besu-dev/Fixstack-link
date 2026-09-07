import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldAlert, Wrench, ChevronRight } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ 
  activeSection, 
  activePage, 
  onNavigate, 
  setActivePage, 
  onOpenAdminModal 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentActive = activeSection || activePage || 'home';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    } else if (setActivePage) {
      setActivePage(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Brand Logo */}
        <button 
          className="brand-logo" 
          onClick={() => handleNavClick('home')}
          aria-label="FixLink Home"
          type="button"
        >
          <div className="brand-icon-wrapper">
            <div className="brand-orange-ring"></div>
            <div className="brand-wrench-box">
              <Wrench className="brand-wrench-svg" size={22} />
            </div>
          </div>
          <div className="brand-text-wrapper">
            <span className="brand-text-fix">Fix</span>
            <span className="brand-text-link">Link</span>
            <span className="brand-text-et">ET</span>
          </div>
        </button>

        {/* Desktop Navigation - Smooth Single-Page Unified Track */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navLinks.map((link) => (
              <li key={link.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${currentActive === link.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(link.id)}
                  aria-current={currentActive === link.id ? 'true' : undefined}
                >
                  <span className="nav-link-text">{link.label}</span>
                  {currentActive === link.id && <span className="nav-active-indicator" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Action: Admin Login Button (Visually Separate) */}
        <div className="navbar-actions">
          <button 
            className="btn btn-admin btn-sm"
            onClick={onOpenAdminModal}
            title="Administrator Portal"
            id="admin-login-nav-btn"
            type="button"
          >
            <ShieldAlert size={16} />
            <span>Admin Login</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-toggle-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-content">
          <nav className="mobile-nav" aria-label="Mobile Navigation">
            <ul className="mobile-nav-list">
              {navLinks.map((link) => (
                <li key={link.id} className="mobile-nav-item">
                  <button
                    type="button"
                    className={`mobile-nav-link ${currentActive === link.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(link.id)}
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={18} className="mobile-nav-chevron" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-drawer-footer">
            <div className="mobile-app-notice">
              <span className="notice-tag">Mobile App</span>
              <p>Customer booking & provider registration happen on the FixLink mobile app.</p>
            </div>
            
            <button 
              type="button"
              className="btn btn-primary w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminModal();
              }}
            >
              <ShieldAlert size={18} />
              <span>Admin Dashboard Login</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
