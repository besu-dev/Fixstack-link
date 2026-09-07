import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Share2
} from 'lucide-react';
import './ContactPage.css';

export default function ContactPage({ onShowToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'seeker',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.message.trim()) newErrors.message = 'Message content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      onShowToast('Thank you! Your message has been received by our Addis Ababa support team.', 'success');
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        role: 'seeker',
        subject: '',
        message: ''
      });
    }, 800);
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <section className="contact-hero-header">
        <div className="container">
          <span className="section-tag">Get in Touch</span>
          <h1 className="contact-main-title">We’re Here to Help You in Ethiopia</h1>
          <p className="contact-subtitle">
            Have questions about FixLink, technician onboarding, or need partnership support? Reach out to our Addis Ababa headquarters.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="section contact-form-section">
        <div className="container">
          <div className="contact-main-grid">
            {/* Left Column: Direct Info Cards */}
            <div className="contact-info-col">
              <div className="info-header-box">
                <h3 className="info-col-title">FixLink Support & Headquarters</h3>
                <p className="info-col-desc">
                  Our operations team is available to assist households, technicians, and municipal partners.
                </p>
              </div>

              <div className="contact-cards-stack">
                {/* Single Phone Number Card */}
                <div className="contact-touch-card">
                  <div className="touch-icon-box blue">
                    <Phone size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Phone Number</span>
                    <a href="tel:+251913426886" className="touch-value">+251 913 426 886</a>
                  </div>
                </div>

                {/* Single Email Address Card */}
                <div className="contact-touch-card">
                  <div className="touch-icon-box orange">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Email Address</span>
                    <a href="mailto:support@fixlink.et" className="touch-value">support@fixlink.et</a>
                  </div>
                </div>

                {/* Social Media Links: Facebook, LinkedIn, X */}
                <div className="contact-touch-card contact-social-card">
                  <div className="touch-icon-box purple">
                    <Share2 size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Social Media</span>
                    <div className="contact-social-links">
                      <a 
                        href="https://facebook.com/fixlink" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="social-chip facebook"
                        aria-label="Facebook"
                        title="FixLink on Facebook"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                      </a>
                      <a 
                        href="https://linkedin.com/company/fixlink" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="social-chip linkedin"
                        aria-label="LinkedIn"
                        title="FixLink on LinkedIn"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </a>
                      <a 
                        href="https://x.com/fixlink" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="social-chip x-twitter"
                        aria-label="X (formerly Twitter)"
                        title="FixLink on X"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span>X</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Right Column: Interactive Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                <h3 className="form-card-title">Send a Direct Message</h3>
                <p className="form-card-subtitle">
                  Fill out the details below and an operations specialist will respond within 24 hours.
                </p>

                {submitted && (
                  <div className="form-success-banner">
                    <CheckCircle2 size={20} />
                    <span>Message dispatched successfully! We will contact you shortly.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="actual-contact-form" noValidate>


                  {/* Name and Phone Row */}
                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label" htmlFor="fullName">Full Name *</label>
                      <input 
                        type="text" 
                        id="fullName"
                        className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                        placeholder="e.g., Abebe Kebede"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                      {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Ethiopian Phone Number *</label>
                      <input 
                        type="tel" 
                        id="phone"
                        className={`form-input ${errors.phone ? 'input-error' : ''}`}
                        placeholder="e.g., +251 911 234 567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>
                  </div>

                  {/* Email and Subject */}
                  <div className="form-row-two">
                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Email Address (Optional)</label>
                      <input 
                        type="email" 
                        id="email"
                        className="form-input"
                        placeholder="e.g., abebe@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="subject">Subject</label>
                      <input 
                        type="text" 
                        id="subject"
                        className="form-input"
                        placeholder="e.g., Technician Registration Inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="message">How can we help? *</label>
                    <textarea 
                      id="message"
                      rows={5}
                      className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                      placeholder="Describe your inquiry, question, or feedback in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    {errors.message && <span className="error-text">{errors.message}</span>}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send size={18} />
                      </>
                    )}
                  </button>

                  <p className="form-privacy-note">
                    By submitting, you agree to FixLink's privacy policy. For urgent repair requests, please download and book via the <strong>FixLink Mobile App</strong>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
