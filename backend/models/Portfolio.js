const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  holdings: [{
    symbol: String,
    shares: Number,
    avgPrice: Number
  }]
});

module.exports = mongoose.model('Portfolio', portfolioSchema); 