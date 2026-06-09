require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Wise API configuration
const WISE_API_URL = process.env.WISE_API_URL || 'https://api.wise-sandbox.com';
const WISE_API_TOKEN = process.env.WISE_API_TOKEN;
let cachedProfileId = null;

// Get Wise profile ID
async function getProfileId() {
  if (cachedProfileId) return cachedProfileId;
  const response = await axios.get(`${WISE_API_URL}/v2/profiles`, {
    headers: { 'Authorization': `Bearer ${WISE_API_TOKEN}` }
  });
  cachedProfileId = response.data[0].id;
  return cachedProfileId;
}

// API endpoint - Get bank details (NO AUTH NEEDED)
app.get('/api/bank-details', async (req, res) => {
  try {
    const currency = req.query.currency || 'USD';
    const profileId = await getProfileId();

    // Generate a unique reference for this payment
    const reference = `RESUME_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Return bank details (mock data for sandbox)
    res.json({
      success: true,
      data: {
        currency: currency,
        bankName: 'Wise',
        accountNumber: '12345678',
        sortCode: '04-00-04',
        iban: 'GB00WISE1234567890',
        swift: 'WISEGB2L',
        reference: reference,
        amount: req.query.amount || '5/10/15',
        instructions: 'Send exactly the amount for your selected plan and include the reference number'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});