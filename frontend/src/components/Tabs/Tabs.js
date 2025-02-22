import React from 'react';
import './Tabs.css';

function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      <button 
        className={`tab ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        Home
      </button>
      <button 
        className={`tab ${activeTab === 'trade' ? 'active' : ''}`}
        onClick={() => setActiveTab('trade')}
      >
        Trade
      </button>
      <button 
        className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
        onClick={() => setActiveTab('portfolio')}
      >
        Portfolio
      </button>
    </div>
  );
}

export default Tabs; 