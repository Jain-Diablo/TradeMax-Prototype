const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// Stock data route
router.get('/:symbol', auth, async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const [quoteResponse, historicalResponse] = await Promise.all([
      axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`),
      axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}.BSE&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`)
    ]);
    console.log(quoteResponse.data);
    
    
    // Check if we got valid data
    if (!quoteResponse.data['Global Quote'] || Object.keys(quoteResponse.data['Global Quote']).length === 0) {
      return res.status(404).json({ error: 'Stock data not found' });
    }

    const stockData = quoteResponse.data['Global Quote'];
    const historicalData = historicalResponse.data['Time Series (Daily)'];
    
    const formattedData = {
      symbol: stockData['01. symbol'] || symbol,
      price: stockData['05. price'] || '0',
      change: stockData['09. change'] || '0',
      changePercent: stockData['10. change percent'] || '0%',
      historical: historicalData ? 
        Object.entries(historicalData).slice(0, 30).map(([date, data]) => ({
          date,
          price: data['4. close']
        })).reverse() : []
    };
    
    res.json(formattedData);
  } catch (error) {
    console.error('Stock API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch stock data. Please try again later.' });
  }
});

module.exports = router;