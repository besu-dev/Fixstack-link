import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import './App.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const scrollToSection = (sectionId) => {
    if (sectionId === 'home') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
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
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // ScrollSpy: Automatically detect which section is in viewport while scrolling
  useEffect(() => {
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
          // When the section header reaches near the navbar (<= 140px from top)
          if (rect.top <= 140) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-root">
      {/* Sticky Top Navbar */}
      <Navbar 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
        onOpenAdminModal={() => setAdminModalOpen(true)} 
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
          <ContactPage onShowToast={showToast} onOpenAdminModal={() => setAdminModalOpen(true)} />
        </section>
      </main>

      {/* Global Footer */}
      <Footer 
        onNavigate={scrollToSection} 
        onOpenAdminModal={() => setAdminModalOpen(true)} 
      />

      {/* Admin Dashboard Gateway Modal */}
      <AdminLoginModal 
        isOpen={adminModalOpen} 
        onClose={() => setAdminModalOpen(false)} 
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
