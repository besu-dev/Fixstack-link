import React, { useState } from 'react';
import {
  Wrench,
  FileText,
  Users,
  CheckCircle,
  UserPlus,
  MapPin,
  Bell,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import './FlowTabs.css';

export default function FlowTabs({ onExploreServices }) {
  const [activeTab, setActiveTab] = useState('seeker'); // 'seeker' | 'provider'

  const seekerSteps = [
    {
      step: '01',
      icon: Wrench,
      title: 'Choose a Service',
      desc: 'Browse our catalog of plumbing, electrical, appliances, carpentry, or finishing categories directly in the Bete mobile app.',
      highlight: '5 Core Categories'
    },
    {
      step: '02',
      icon: FileText,
      title: 'Describe the Repair Problem',
      desc: 'Tell us what is broken. Add photos, voice notes, or specific notes (e.g., leaking water pump in Bole) so technicians understand your need.',
      highlight: 'Photo & Note Uploads'
    },
    {
      step: '03',
      icon: Users,
      title: 'Connect with a Service Provider',
      desc: 'Nearby verified technicians review your request, submit competitive bids, or get matched instantly based on proximity and rating.',
      highlight: 'Verified Technicians'
    },
    {
      step: '04',
      icon: CheckCircle,
      title: 'Get Repair Done & Rate',
      desc: 'The technician arrives at your home, diagnoses and completes the repair. Confirm job completion, release payment, and leave a review.',
      highlight: 'Satisfaction Guaranteed'
    }
  ];

  const providerSteps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Create Professional Profile',
      desc: 'Download the FixLink mobile app, sign up as a Service Provider, and upload your Kebele ID and Trade Certifications for verification.',
      highlight: 'Kebele ID & Trade Cert'
    },
    {
      step: '02',
      icon: MapPin,
      title: 'Select Skills & Service Area',
      desc: 'Choose your trades (e.g., House Wiring, Pipe Repair, Refrigerator) and your operational subcities in Addis Ababa.',
      highlight: 'Subcity Coverage'
    },
    {
      step: '03',
      icon: Bell,
      title: 'Receive Service Requests',
      desc: 'Get notified in real-time on your phone when households in your selected area need your specific expertise.',
      highlight: 'Instant Job Alerts'
    },
    {
      step: '04',
      icon: Briefcase,
      title: 'Accept Jobs & Earn Fair Income',
      desc: 'Submit transparent bids or accept direct requests. Complete quality work, get paid seamlessly, and build your 5-star reputation.',
      highlight: 'Transparent Payouts'
    }
  ];

  const currentSteps = activeTab === 'seeker' ? seekerSteps : providerSteps;

  return (
    <div className="flow-tabs-container">
      {/* Tab Switcher Buttons */}
      <div className="flow-tab-nav">
        <button
          className={`flow-tab-btn ${activeTab === 'seeker' ? 'active' : ''}`}
          onClick={() => setActiveTab('seeker')}
        >
          <span className="tab-title">For Service Seekers</span>
        </button>

        <button
          className={`flow-tab-btn ${activeTab === 'provider' ? 'active' : ''}`}
          onClick={() => setActiveTab('provider')}
        >
          <span className="tab-title">For Service Providers</span>
        </button>
      </div>

      {/* Steps Flow Grid */}
      <div className="steps-flow-grid">
        {currentSteps.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={item.step} className="flow-step-card">
              <div className="step-card-header">
                <span className="step-number">{item.step}</span>
                <div className="step-icon-wrap">
                  <IconComponent size={24} />
                </div>
              </div>

              <div className="step-card-content">
                <span className="step-highlight-tag">{item.highlight}</span>
                <h4 className="step-title">{item.title}</h4>
                <p className="step-description">{item.desc}</p>
              </div>

              {index < currentSteps.length - 1 && (
                <div className="step-connector-arrow">
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
