const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');

router.get('/bank-details', authenticateUser, (req, res) => {
  res.json({ success: true, data: { message: 'Bank details endpoint ready' } });
});

router.post('/bank-transfer-order', authenticateUser, (req, res) => {
  res.json({ success: true, data: { reference: 'TEST_' + Date.now() } });
});

module.exports = router;