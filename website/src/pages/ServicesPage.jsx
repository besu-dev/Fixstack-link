import React, { useState, useMemo } from 'react';
import { SERVICE_CATEGORIES } from '../api/services';
import { 
  Search, 
  Filter, 
  Info, 
  Smartphone, 
  ArrowRight, 
  CheckCircle, 
  Wrench, 
  Zap, 
  Tv, 
  Hammer, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import './ServicesPage.css';

const ICON_MAP = {
  Wrench: Wrench,
  Zap: Zap,
  Tv: Tv,
  Hammer: Hammer,
  Sparkles: Sparkles,
};

export default function ServicesPage({ onShowToast, setActivePage }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories and subservices based on tab and search
  const filteredData = useMemo(() => {
    return SERVICE_CATEGORIES.filter((cat) => {
      const matchesCategory = selectedCategory === 'all' || cat.id === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const matchTitle = cat.title.toLowerCase().includes(query);
      const matchTagline = cat.tagline.toLowerCase().includes(query);
      const matchSub = cat.subservices.some((sub) => 
        sub.name.toLowerCase().includes(query) || sub.desc.toLowerCase().includes(query)
      );

      return matchTitle || matchTagline || matchSub;
    });
  }, [selectedCategory, searchQuery]);

  const handleBookingNotice = (subserviceName) => {
    onShowToast(`To request "${subserviceName}", please use the FixLink Mobile App. Website is informational only.`, 'info');
  };

  return (
    <div className="services-page">
      {/* Services Header */}
      <section className="services-hero-header">
        <div className="container">
          <span className="section-tag">Repair Services Directory</span>
          <h1 className="services-main-title">Professional Household Services in Ethiopia</h1>
          <p className="services-hero-desc">
            Explore verified repair services available across Addis Ababa. From complex electrical rewiring to delicate kitchen appliance repairs, our technicians are certified and ready.
          </p>

          {/* Important Informational Notice Banner */}
          <div className="info-notice-banner">
            <Info size={22} className="info-banner-icon" />
            <div className="info-banner-text">
              <strong>Informational Catalog Notice:</strong>
              <span>
                Users cannot book services directly through this website. All price estimates, technician bidding, and job execution are managed safely within the <strong>FixLink Mobile App</strong>.
              </span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setActivePage('how-it-works')}>
              <span>How Booking Works</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="services-toolbar">
            {/* Search Input */}
            <div className="services-search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search repair services (e.g., Water Heater, House Wiring, Generator)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search repair services"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  Clear
                </button>
              )}
            </div>

            {/* Filter Chips */}
            <div className="services-filter-chips">
              <button 
                className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Trades
              </button>

              {SERVICE_CATEGORIES.map((cat) => (
                <button 
                  key={cat.id}
                  className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Catalog */}
      <section className="section services-catalog-section">
        <div className="container">
          {filteredData.length === 0 ? (
            <div className="empty-results-box">
              <Wrench size={48} className="empty-icon" />
              <h3>No repair services matched your search</h3>
              <p>Try searching for broader keywords such as "pipe", "wire", "pump", or "stove".</p>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="categories-list">
              {filteredData.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || Wrench;
                return (
                  <div key={category.id} className="category-detail-block" id={category.id}>
                    {/* Category Title Header */}
                    <div className="cat-detail-header">
                      <div className="cat-header-left">
                        <div 
                          className="cat-badge-icon"
                          style={{ 
                            backgroundColor: category.accentLight, 
                            color: category.accentColor 
                          }}
                        >
                          <IconComponent size={28} />
                        </div>
                        <div>
                          <div className="cat-title-row">
                            <h2 className="cat-title">{category.title}</h2>
                            {category.popular && (
                              <span className="cat-popular-pill">High Demand</span>
                            )}
                          </div>
                          <p className="cat-tagline">{category.tagline}</p>
                        </div>
                      </div>
                      <p className="cat-description-long">{category.description}</p>
                    </div>

                    {/* Subskills Cards Grid */}
                    <div className="subskills-cards-grid">
                      {category.subservices.map((sub) => (
                        <div key={sub.id} className="subservice-item-card">
                          <div className="subservice-img-wrap">
                            <img 
                              src={sub.image} 
                              alt={sub.name} 
                              loading="lazy"
                              onError={(e) => {
                                // Fallback image
                                e.target.src = 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=400';
                              }}
                            />
                            <span 
                              className="subservice-trade-tag"
                              style={{ backgroundColor: category.accentColor }}
                            >
                              {category.shortName}
                            </span>
                          </div>

                          <div className="subservice-item-content">
                            <h4 className="subservice-name">{sub.name}</h4>
                            <p className="subservice-desc">{sub.desc}</p>

                            <div className="subservice-footer">
                              <span className="informational-label">
                                <Smartphone size={14} /> Book on Mobile App
                              </span>
                              <button 
                                className="subservice-action-link"
                                onClick={() => handleBookingNotice(sub.name)}
                              >
                                <span>Details</span>
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom App Callout Strip */}
          <div className="services-bottom-cta">
            <div className="cta-left">
              <Smartphone size={32} className="cta-icon" />
              <div>
                <h3>Need a custom repair or diagnostic quote?</h3>
                <p>Post your job in the FixLink mobile app to receive competitive bids from Addis Ababa's verified technicians.</p>
              </div>
            </div>
            <button className="btn btn-white" onClick={() => setActivePage('how-it-works')}>
              <span>View How It Works</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
