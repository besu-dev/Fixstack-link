import React from 'react';
import {
  Smartphone,
  Download,
  QrCode,
  Zap,
  MessageSquare
} from 'lucide-react';
import './MobileAppBanner.css';

export default function MobileAppBanner() {
  const downloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL || 'https://fixlink.et/download';

  return (
    <section className="app-banner-section">
      <div className="container app-banner-container">
        <div className="app-banner-card">
          <div className="app-banner-content">
            <span className="app-tag-pill">
              <Smartphone size={15} /> Mobile-First Ecosystem
            </span>

            <h2 className="app-banner-title">
              Repairs, Bidding & Tracking — All in One Place.
            </h2>

            <p className="app-banner-desc">
              Whether you’re a customer looking for a reliable technician or a skilled service provider looking for new job opportunities, the Bete mobile app makes it easy to request services, receive job offers, submit bids, communicate, and track repairs—all from your phone.
            </p>

            <div className="app-features-grid">
              <div className="app-feat-item">
                <Zap size={16} className="feat-icon" />
                <span>Instant In-App Bidding</span>
              </div>
              <div className="app-feat-item">
                <MessageSquare size={16} className="feat-icon" />
                <span>Direct Provider Chat</span>
              </div>
            </div>

            <div className="app-store-actions">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="store-btn google-play"
              >
                <div className="store-icon">
                  <Download size={20} />
                </div>
                <div className="store-text">
                  <span className="store-small">GET IT ON</span>
                  <span className="store-big">Google Play</span>
                </div>
              </a>

              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="store-btn app-store"
              >
                <div className="store-icon">
                  <Smartphone size={20} />
                </div>
                <div className="store-text">
                  <span className="store-small">Download on the</span>
                  <span className="store-big">App Store</span>
                </div>
              </a>
            </div>
          </div>

          <div className="app-banner-mockup">
            <div className="qr-box">
              <QrCode size={130} className="qr-svg" />
              <span className="qr-label">Scan to install Bete App</span>
              <span className="qr-sublabel">Android & iOS Supported</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
