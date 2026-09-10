import React, { useState } from 'react';
import {
  Wrench,
  FileText,
  Users,
  CheckCircle,
  UserPlus,
  MapPin,
  Bell,
  Briefcase
} from 'lucide-react';
import './FlowTabs.css';

export default function FlowTabs({ onExploreServices }) {
  const [activeTab, setActiveTab] = useState('seeker'); // 'seeker' | 'provider'

  const seekerSteps = [
    {
      step: '01',
      icon: Wrench,
      title: 'Choose a Service',
      desc: 'Browse plumbing, electrical, appliances, carpentry, or finishing services directly in the Bete app.'
    },
    {
      step: '02',
      icon: FileText,
      title: 'Describe Your Issue',
      desc: 'Tell us what is broken with notes or photos so technicians clearly understand your repair need.'
    },
    {
      step: '03',
      icon: Users,
      title: 'Connect with a Pro',
      desc: 'Get matched with background-checked local technicians and receive transparent repair bids.'
    },
    {
      step: '04',
      icon: CheckCircle,
      title: 'Get Done & Rate',
      desc: 'The technician completes the job. Confirm satisfactory completion, pay, and leave a review.'
    }
  ];

  const providerSteps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Create Profile',
      desc: 'Download the Bete app, register as a Service Provider, and upload your national ID &  skill certifications.'
    },
    {
      step: '02',
      icon: MapPin,
      title: 'Set Trade & Area',
      desc: 'Select your specialties and operational subcities across Addis Ababa.'
    },
    {
      step: '03',
      icon: Bell,
      title: 'Receive Job Requests',
      desc: 'Get notified in real time when households in your selected area need your specific expertise.'
    },
    {
      step: '04',
      icon: Briefcase,
      title: 'Complete & Earn',
      desc: 'Submit competitive bids, complete quality repairs, build your reputation, and earn reliably.'
    }
  ];

  const currentSteps = activeTab === 'seeker' ? seekerSteps : providerSteps;

  return (
    <div className="flow-tabs-container">
      {/* Sleek Minimal Tab Switcher */}
      <div className="flow-tab-wrapper">
        <div className="flow-tab-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'seeker'}
            className={`flow-tab-btn ${activeTab === 'seeker' ? 'active' : ''}`}
            onClick={() => setActiveTab('seeker')}
          >
            For Service Seekers
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'provider'}
            className={`flow-tab-btn ${activeTab === 'provider' ? 'active' : ''}`}
            onClick={() => setActiveTab('provider')}
          >
            For Service Providers
          </button>
        </div>
      </div>

      {/* Steps Flow Grid */}
      <div className="steps-flow-grid">
        {currentSteps.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.step} className="flow-step-card">
              <div className="step-top-row">
                <span className="step-badge">Step {item.step}</span>
                <div className="step-icon-circle">
                  <IconComponent size={18} />
                </div>
              </div>

              <h4 className="step-title">{item.title}</h4>
              <p className="step-description">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
