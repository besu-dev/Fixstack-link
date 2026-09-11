import React, { useState, useMemo } from 'react';
import { SERVICE_CATEGORIES } from '../api/services';
import {
  Search,
  Wrench
} from 'lucide-react';
import './ServicesPage.css';

export default function ServicesPage({ onShowToast, onNavigate, setActivePage }) {
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


  return (
    <div className="services-page">
      {/* Services Header */}
      <section className="services-hero-header">
        <div className="container">
          <span className="section-tag">Our Services</span>
          <h1 className="services-main-title">Household Repair & Maintenance Services</h1>
          <p className="services-hero-desc">
            Find trusted technicians for your household repair and maintenance needs. Bete offers services including plumbing, electrical work, water pump repair, appliance repair, and general maintenance.          </p>

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
                return (
                  <div key={category.id} className="category-detail-block" id={category.id}>
                    {/* Category Title Header */}
                    <div className="cat-detail-header">
                      <div className="cat-header-info">
                        <h2 className="cat-title">{category.title}</h2>
                        <p className="cat-tagline">{category.tagline}</p>
                      </div>
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

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
