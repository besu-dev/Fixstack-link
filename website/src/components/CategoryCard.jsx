import React from 'react';
import { 
  Wrench, 
  Zap, 
  Tv, 
  Hammer, 
  Sparkles, 
  ArrowRight, 
  Check 
} from 'lucide-react';
import './CategoryCard.css';

const ICON_MAP = {
  Wrench: Wrench,
  Zap: Zap,
  Tv: Tv,
  Hammer: Hammer,
  Sparkles: Sparkles,
};

export default function CategoryCard({ category, onSelectCategory }) {
  const IconComponent = ICON_MAP[category.icon] || Wrench;

  return (
    <div className="category-card" style={{ '--card-accent': category.accentColor }}>
      {/* Card Header & Icon */}
      <div className="cat-card-header">
        <div 
          className="cat-icon-container" 
          style={{ 
            backgroundColor: category.accentLight, 
            color: category.accentColor 
          }}
        >
          <IconComponent size={28} />
        </div>
        {category.popular && (
          <span className="popular-badge">Popular in Addis</span>
        )}
      </div>

      {/* Category Info */}
      <div className="cat-card-body">
        <h3 className="cat-card-title">{category.title}</h3>
        <p className="cat-card-tagline">{category.tagline}</p>
        <p className="cat-card-desc">{category.description}</p>

        {/* Subservices List */}
        <div className="cat-subservices-section">
          <span className="subservices-heading">Included Repairs:</span>
          <div className="subskills-tags-wrap">
            {category.subservices.map((sub) => (
              <span key={sub.id} className="subskill-pill">
                <Check size={12} className="check-bullet" />
                {sub.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="cat-card-footer">
        <button 
          className="cat-explore-btn"
          onClick={() => onSelectCategory(category.id)}
        >
          <span>View Details & Subskills</span>
          <ArrowRight size={16} className="btn-arrow" />
        </button>
      </div>
    </div>
  );
}
