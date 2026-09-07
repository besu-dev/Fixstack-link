import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import './ContactPage.css';

export default function ContactPage({ onShowToast, onOpenAdminModal }) {
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
                  Our operations team is available Monday through Saturday to assist households, technicians, and municipal partners.
                </p>
              </div>

              <div className="contact-cards-stack">
                <div className="contact-touch-card">
                  <div className="touch-icon-box blue">
                    <Phone size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Direct Phone Lines</span>
                    <a href="tel:+251913426886" className="touch-value">+251 913 426 886</a>
                    <a href="tel:+251911234567" className="touch-subvalue">+251 911 234 567 (Toll Support)</a>
                  </div>
                </div>

                <div className="contact-touch-card">
                  <div className="touch-icon-box orange">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Email Enquiries</span>
                    <a href="mailto:support@fixlink.et" className="touch-value">support@fixlink.et</a>
                    <span className="touch-subvalue">contact@fixlink.et (Business & Press)</span>
                  </div>
                </div>

                <div className="contact-touch-card">
                  <div className="touch-icon-box sky">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Addis Ababa Office</span>
                    <p className="touch-address">
                      Cameroon Street, Next to Edna Mall / Medhanialem,<br />
                      Bole Subcity, Addis Ababa, Ethiopia
                    </p>
                  </div>
                </div>

                <div className="contact-touch-card">
                  <div className="touch-icon-box green">
                    <Clock size={22} />
                  </div>
                  <div>
                    <span className="touch-label">Customer Service Hours</span>
                    <p className="touch-address">
                      Monday – Saturday: 8:00 AM – 7:00 PM EAT<br />
                      Sunday: Emergency Dispatch On-Call
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Gateway Notice */}
              <div className="contact-admin-box">
                <ShieldAlert size={20} className="admin-box-icon" />
                <div>
                  <strong>Platform Administrator?</strong>
                  <p>Operations staff can access verification consoles directly.</p>
                </div>
                <button className="btn btn-admin btn-sm" onClick={onOpenAdminModal}>
                  Admin Login
                </button>
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
                  {/* Role Selector */}
                  <div className="form-group">
                    <label className="form-label">I am contacting as:</label>
                    <div className="role-selector-radios">
                      <label className={`role-radio-label ${formData.role === 'seeker' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          value="seeker" 
                          checked={formData.role === 'seeker'}
                          onChange={() => setFormData({ ...formData, role: 'seeker' })}
                        />
                        <span>Service Seeker (Household)</span>
                      </label>

                      <label className={`role-radio-label ${formData.role === 'provider' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          value="provider" 
                          checked={formData.role === 'provider'}
                          onChange={() => setFormData({ ...formData, role: 'provider' })}
                        />
                        <span>Service Provider (Technician)</span>
                      </label>

                      <label className={`role-radio-label ${formData.role === 'partner' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="role" 
                          value="partner" 
                          checked={formData.role === 'partner'}
                          onChange={() => setFormData({ ...formData, role: 'partner' })}
                        />
                        <span>Business / Partner</span>
                      </label>
                    </div>
                  </div>

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
