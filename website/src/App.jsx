import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import AdminApp from './admin/AdminApp';
import './App.css';

export default function App() {
  // Check initial route: either pathname is /admin or hash starts with #admin or query param ?view=admin
  const checkIsAdminPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.includes('/admin') ||
      hash.startsWith('#admin') ||
      hash.startsWith('#/admin') ||
      search.includes('view=admin')
    );
  };

  const [isAdminMode, setIsAdminMode] = useState(checkIsAdminPath);
  const [activeSection, setActiveSection] = useState('home');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Sync with browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setIsAdminMode(checkIsAdminPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({ view: 'admin' }, 'Bete Admin Portal', '/admin');
    setIsAdminMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitAdmin = () => {
    window.history.pushState({ view: 'site' }, 'Bete Ethiopia', '/');
    setIsAdminMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    if (sectionId === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setActiveSection('home');
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 75;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth',
      });
      setActiveSection(sectionId);
    }
  };

  // ScrollSpy: Automatically detect which section is in viewport while scrolling
  useEffect(() => {
    if (isAdminMode) return;

    const sections = ['home', 'services', 'how-it-works', 'about', 'contact'];

    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom of page detection -> highlight Contact
      if (windowHeight + scrollY >= docHeight - 80) {
        setActiveSection('contact');
        return;
      }

      // Top of page detection -> highlight Home
      if (scrollY < 100) {
        setActiveSection('home');
        return;
      }

      // Loop through sections to find which section is currently at the top of viewport
      let current = 'home';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminMode]);

  // If Admin Mode is active, render full Bete Admin Portal
  if (isAdminMode) {
    return <AdminApp onExitToSite={exitAdmin} />;
  }

  // Otherwise, render the Bete Public Website & Landing Page
  return (
    <div className="app-root">
      {/* Sticky Top Navbar with Admin Portal connection */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection}
        onAdminClick={navigateToAdmin}
      />

      {/* Unified Single-Page Continuous Sections */}
      <main className="main-content">
        <section id="home" className="page-section">
          <HomePage onNavigate={scrollToSection} />
        </section>

        <section id="services" className="page-section">
          <ServicesPage onShowToast={showToast} onNavigate={scrollToSection} />
        </section>

        <section id="how-it-works" className="page-section">
          <HowItWorksPage onNavigate={scrollToSection} />
        </section>

        <section id="about" className="page-section">
          <AboutPage onNavigate={scrollToSection} />
        </section>

        <section id="contact" className="page-section">
          <ContactPage onShowToast={showToast} />
        </section>
      </main>

      {/* Global Footer with Admin Portal link */}
      <Footer 
        onNavigate={scrollToSection}
        onAdminClick={navigateToAdmin}
      />

      {/* Feedback Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
