import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { fetchProviders } from '../api/services';
import './HomePage.css';

export default function HomePage({ onNavigate, setActivePage }) {
  const [providers, setProviders] = useState([]);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const res = await fetchProviders();
      if (isMounted) {
        setProviders(res.data);
        setIsLiveApi(res.isLive);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      <Hero 
        onExploreServices={() => (onNavigate ? onNavigate('services') : setActivePage && setActivePage('services'))}
        onHowItWorks={() => (onNavigate ? onNavigate('how-it-works') : setActivePage && setActivePage('how-it-works'))}
        totalProviders={providers.length}
        isBackendLive={isLiveApi}
      />
    </div>
  );
}
