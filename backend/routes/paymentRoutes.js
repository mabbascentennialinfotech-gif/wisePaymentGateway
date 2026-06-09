const express = require('express');
const router = express.Router();
const {
  getBankDetails,
  createBankTransferOrder,
  getOrderStatus,
  initiateWiseRedirect,
  completeWiseRedirect
} = require('../controllers/paymentController');

// ✅ Public route - No authentication needed for bank details
router.get('/bank-details', getBankDetails);

// These still need authentication (they create orders linked to user)
router.post('/bank-transfer-order', authenticateUser, createBankTransferOrder);
router.get('/order/:orderId/status', authenticateUser, getOrderStatus);

// Option 2 - Requires authentication
router.post('/wise-redirect/initiate', authenticateUser, initiateWiseRedirect);
router.post('/wise-redirect/complete', authenticateUser, completeWiseRedirect);

module.exports = router;
