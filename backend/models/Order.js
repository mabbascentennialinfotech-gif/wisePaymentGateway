const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['basic', 'gold', 'premium'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  reference: {
    type: String,
    unique: true,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'wise_redirect', 'stripe'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  wiseTransferId: {
    type: String,
    default: null
  },
  wiseQuoteId: {
    type: String,
    default: null
  },
  oauthState: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique reference
orderSchema.pre('save', async function (next) {
  if (!this.reference) {
    this.reference = `WISE_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);