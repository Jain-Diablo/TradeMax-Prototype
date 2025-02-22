const router = require('express').Router();
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');

// Get user portfolio
router.get('/', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user.id, balance: 0 });
    }
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add funds
router.post('/add-funds', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    portfolio.balance += Number(amount);
    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buy stocks
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    const totalCost = shares * price;
    if (portfolio.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
    if (existingHolding) {
      const totalShares = existingHolding.shares + shares;
      existingHolding.avgPrice = ((existingHolding.shares * existingHolding.avgPrice) + totalCost) / totalShares;
      existingHolding.shares = totalShares;
    } else {
      portfolio.holdings.push({ symbol, shares, avgPrice: price });
    }

    portfolio.balance -= totalCost;
    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sell stocks
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    
    const holding = portfolio.holdings.find(h => h.symbol === symbol);
    if (!holding || holding.shares < shares) {
      return res.status(400).json({ error: 'Insufficient shares' });
    }

    const totalValue = shares * price;
    holding.shares -= shares;
    portfolio.balance += totalValue;

    if (holding.shares === 0) {
      portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
    }

    await portfolio.save();
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 