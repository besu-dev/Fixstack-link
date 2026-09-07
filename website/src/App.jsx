import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/AdminLoginPage';
import './App.css';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'services':
        return <ServicesPage onShowToast={showToast} setActivePage={setActivePage} />;
      case 'how-it-works':
        return <HowItWorksPage setActivePage={setActivePage} />;
      case 'about':
        return <AboutPage setActivePage={setActivePage} />;
      case 'contact':
        return <ContactPage onShowToast={showToast} onOpenAdminModal={() => setAdminModalOpen(true)} />;
      case 'admin':
        return <AdminLoginPage setActivePage={setActivePage} />;
      case 'home':
      default:
        return (
          <HomePage 
            setActivePage={setActivePage} 
            onOpenAdminModal={() => setAdminModalOpen(true)} 
            onShowToast={showToast} 
          />
        );
    }
  };

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onOpenAdminModal={() => setAdminModalOpen(true)} 
      />

      {/* Main Page Body */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Global Footer */}
      <Footer 
        setActivePage={setActivePage} 
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
