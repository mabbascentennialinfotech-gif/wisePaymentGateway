const wiseService = require('../services/wiseService');

const getBalances = async (req, res) => {
  try {
    const balances = await wiseService.getBalances();
    res.json({ success: true, data: balances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createQuote = async (req, res) => {
  try {
    const { sourceCurrency, targetCurrency, amount } = req.body;
    const quote = await wiseService.createQuote(sourceCurrency, targetCurrency, amount);
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getBalances, createQuote };