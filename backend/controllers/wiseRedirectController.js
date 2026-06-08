const wiseService = require('../services/wiseService');
const Transaction = require('../models/Transaction');
const Recipient = require('../models/Recipient');

const getBalances = async (req, res) => {
  try {
    console.log('Fetching balances...');
    const balances = await wiseService.getBalances();
    console.log('Balances fetched:', balances);
    res.json({ success: true, data: balances });
  } catch (error) {
    console.error('Detailed error in getBalances:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
};

const getBalanceForCurrency = async (req, res) => {
  try {
    const { currency } = req.params;
    const balance = await wiseService.getBalanceForCurrency(currency.toUpperCase());
    res.json({ success: true, data: balance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createQuote = async (req, res) => {
  try {
    const { sourceCurrency, targetCurrency, amount, isSourceAmount = true } = req.body;

    const quote = await wiseService.createQuote(
      sourceCurrency.toUpperCase(),
      targetCurrency.toUpperCase(),
      amount,
      isSourceAmount
    );

    res.json({
      success: true,
      data: {
        quoteId: quote.id,
        sourceCurrency: quote.sourceCurrency,
        targetCurrency: quote.targetCurrency,
        sourceAmount: quote.sourceAmount,
        targetAmount: quote.targetAmount,
        rate: quote.rate,
        fee: quote.fee,
        totalAmount: quote.totalAmount,
        expiresAt: quote.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createRecipient = async (req, res) => {
  try {
    const recipientData = req.body;

    const recipient = await wiseService.createRecipient(recipientData);

    // Save to database
    const savedRecipient = await Recipient.create({
      userId: req.user._id,
      wiseAccountId: recipient.id,
      fullName: recipientData.fullName,
      email: recipientData.email,
      currency: recipientData.currency,
      country: recipientData.country,
      bankDetails: recipientData.bankDetails
    });

    res.json({
      success: true,
      data: {
        id: savedRecipient._id,
        wiseId: recipient.id,
        fullName: savedRecipient.fullName,
        currency: savedRecipient.currency
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRecipients = async (req, res) => {
  try {
    const recipients = await Recipient.find({
      userId: req.user._id,
      isActive: true
    }).sort({ isFavorite: -1, createdAt: -1 });

    res.json({ success: true, data: recipients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteRecipient = async (req, res) => {
  try {
    const { id } = req.params;

    const recipient = await Recipient.findOne({ _id: id, userId: req.user._id });
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    recipient.isActive = false;
    await recipient.save();

    res.json({ success: true, message: 'Recipient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTransferStatus = async (req, res) => {
  try {
    const { transferId } = req.params;
    const transfer = await wiseService.getTransferStatus(transferId);

    res.json({
      success: true,
      data: {
        transferId: transfer.id,
        status: transfer.status,
        createdAt: transfer.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Transaction.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getExchangeRates = async (req, res) => {
  try {
    const { sourceCurrency, targetCurrency } = req.query;
    const rates = await wiseService.getExchangeRates(sourceCurrency, targetCurrency);
    res.json({ success: true, data: rates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getBalances,
  getBalanceForCurrency,
  createQuote,
  createRecipient,
  getRecipients,
  deleteRecipient,
  getTransferStatus,
  getTransactions,
  getExchangeRates
};