const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { getBalances, createQuote } = require('../controllers/wiseController');

router.get('/balances', authenticateUser, getBalances);
router.post('/quote', authenticateUser, createQuote);

module.exports = router;