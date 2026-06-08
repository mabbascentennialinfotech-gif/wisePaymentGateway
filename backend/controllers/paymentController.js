const wiseService = require('../services/wiseService');
const Order = require('../models/Order');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// ========== OPTION 1: Bank Transfer ==========

// Get bank details to show customer
const getBankDetails = async (req, res) => {
  try {
    const { currency = 'USD' } = req.query;
    const bankDetails = await wiseService.getBankDetails(currency);

    res.json({
      success: true,
      data: bankDetails
    });
  } catch (error) {
    console.error('Error getting bank details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create a pending order for bank transfer
const createBankTransferOrder = async (req, res) => {
  try {
    const { planType, amount, currency } = req.body;
    const userId = req.user._id;

    // Validate plan
    const validPlans = ['basic', 'gold', 'premium'];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type'
      });
    }

    // Check if user already has this plan
    const user = await User.findById(userId);
    if (user.plan === planType && user.plan !== 'none') {
      return res.status(400).json({
        success: false,
        error: `You already have the ${planType} plan`
      });
    }

    // Create order
    const order = await Order.create({
      userId,
      planType,
      amount,
      currency,
      paymentMethod: 'bank_transfer',
      status: 'pending'
    });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        reference: order.reference,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error creating bank transfer order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Check order status
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        reference: order.reference,
        amount: order.amount,
        currency: order.currency,
        planType: order.planType,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========== OPTION 2: Wise Redirect ==========

// Initiate Wise redirect payment
const initiateWiseRedirect = async (req, res) => {
  try {
    const { planType, amount, currency } = req.body;
    const userId = req.user._id;

    // Validate plan
    const validPlans = ['basic', 'gold', 'premium'];
    if (!validPlans.includes(planType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan type'
      });
    }

    // Create order with OAuth state
    const order = await Order.create({
      userId,
      planType,
      amount,
      currency,
      paymentMethod: 'wise_redirect',
      status: 'pending',
      oauthState: uuidv4()
    });

    // Create Wise quote
    const quote = await wiseService.createQuote(currency, currency, amount);

    // Save quote ID to order
    order.wiseQuoteId = quote.id;
    await order.save();

    // Build OAuth URL for Wise
    const clientId = process.env.WISE_CLIENT_ID || 'sandbox_client_id';
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/checkout/callback`;
    const state = order.oauthState;

    // For sandbox, use sandbox OAuth URL
    const authUrl = process.env.WISE_SANDBOX === 'true'
      ? 'https://sandbox.transferwise.tech/oauth/authorize'
      : 'https://api.wise.com/oauth/authorize';

    const redirectUrl = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=transfers%20balance`;

    res.json({
      success: true,
      data: {
        redirectUrl,
        orderId: order._id,
        state: order.oauthState
      }
    });
  } catch (error) {
    console.error('Error initiating Wise redirect:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Complete Wise redirect payment (callback)
const completeWiseRedirect = async (req, res) => {
  try {
    const { code, state, orderId } = req.body;

    // Find order by state or orderId
    const order = await Order.findOne({
      $or: [
        { oauthState: state },
        { _id: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Order already ${order.status}`
      });
    }

    // Exchange code for access token
    const tokenUrl = process.env.WISE_SANDBOX === 'true'
      ? 'https://sandbox.transferwise.tech/oauth/token'
      : 'https://api.wise.com/oauth/token';

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.WISE_CLIENT_ID,
        client_secret: process.env.WISE_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_URL || 'http://localhost:3000'}/checkout/callback`
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Create transfer using the access token
    // Note: This requires the customer to have a Wise account with funds

    // For sandbox testing, we'll simulate success
    // In production, you would create the transfer with the user's access token

    // Update order status
    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    // Update user's plan
    await User.findByIdAndUpdate(order.userId, {
      plan: order.planType
    });

    res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
        planType: order.planType
      }
    });
  } catch (error) {
    console.error('Error completing Wise redirect:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========== Webhook for Bank Transfer (Option 1) ==========

// Webhook to receive payment notifications from Wise
const handleWiseWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('Received webhook:', event.eventType);

    // Check if it's a credit event (money received)
    if (event.eventType === 'balance#credit') {
      const { amount, currency, reference } = event.data;

      // Find order by reference
      const order = await Order.findOne({ reference: reference });

      if (order && order.status === 'pending') {
        // Verify amount matches
        if (order.amount === amount && order.currency === currency) {
          order.status = 'completed';
          order.completedAt = new Date();
          await order.save();

          // Update user's plan
          await User.findByIdAndUpdate(order.userId, {
            plan: order.planType
          });

          console.log(`✅ Payment completed for order ${order._id}`);
        } else {
          console.log(`⚠️ Amount mismatch for order ${order._id}`);
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};

module.exports = {
  getBankDetails,
  createBankTransferOrder,
  getOrderStatus,
  initiateWiseRedirect,
  completeWiseRedirect,
  handleWiseWebhook
};