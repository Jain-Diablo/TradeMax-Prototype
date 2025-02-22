import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Portfolio.css';

function Portfolio({ refreshTrigger }) {
  const [portfolio, setPortfolio] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/portfolio', {
        withCredentials: true
      });
      console.log('Portfolio data:', response.data); // Debug log
      setPortfolio(response.data);
    } catch (err) {
      console.error('Portfolio fetch error:', err); // Debug log
      setError('Failed to fetch portfolio');
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [refreshTrigger]);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/portfolio/add-funds', 
        { amount: Number(amount) },
        { withCredentials: true }
      );
      fetchPortfolio();
      setAmount('');
    } catch (err) {
      setError('Failed to add funds');
    }
  };

  return (
    <div className="portfolio-container">
      <h2>Your Portfolio</h2>
      {error && <p className="error">{error}</p>}
      
      <div className="balance-section">
        <h3>Balance: ₹{portfolio?.balance?.toFixed(2) || '0.00'}</h3>
        <form onSubmit={handleAddFunds}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
          />
          <button type="submit">Add Funds</button>
        </form>
      </div>

      <div className="holdings-section">
        <h3>Holdings</h3>
        {portfolio?.holdings && portfolio.holdings.length > 0 ? (
          portfolio.holdings.map(holding => (
            <div key={holding.symbol} className="holding-item">
              <h4>{holding.symbol}</h4>
              <p>Shares: {holding.shares}</p>
              <p>Avg Price: ₹{holding.avgPrice.toFixed(2)}</p>
              <p>Total Value: ₹{(holding.shares * holding.avgPrice).toFixed(2)}</p>
            </div>
          ))
        ) : (
          <p>No holdings yet</p>
        )}
      </div>
    </div>
  );
}

export default Portfolio; 