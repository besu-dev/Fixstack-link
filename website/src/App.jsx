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
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 75;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: sectionId === 'home' ? 0 : Math.max(0, elementPosition - navOffset),
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // ScrollSpy: Automatically detect which section is in viewport while scrolling
  useEffect(() => {
    const sections = ['home', 'services', 'how-it-works', 'about', 'contact'];

    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Bottom of page detection -> highlight Contact
      if (windowHeight + scrollY >= docHeight - 100) {
        setActiveSection('contact');
        return;
      }

      // Top of page detection -> highlight Home
      if (scrollY < 200) {
        setActiveSection('home');
        return;
      }

      // Loop through sections from bottom to top to find the first one in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionId = sections[i];
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 120;
          if (scrollY >= top) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
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
