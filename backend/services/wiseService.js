const axios = require('axios');

class WiseService {
  constructor() {
    this.apiUrl = process.env.WISE_API_URL || 'https://api.wise-sandbox.com';
    this.apiToken = process.env.WISE_API_TOKEN;
    this.cachedProfileId = null;

    console.log('✅ Wise Service Initialized');
    console.log('📍 API URL:', this.apiUrl);
    console.log('🔑 Token exists:', !!this.apiToken);
  }

  async _request(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      };
      if (data) config.data = data;
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  async getProfileId() {
    if (this.cachedProfileId) {
      console.log('Using cached profile ID:', this.cachedProfileId);
      return this.cachedProfileId;
    }

    console.log('📡 Fetching profiles from Wise...');
    const profiles = await this._request('get', '/v2/profiles');

    if (!profiles || profiles.length === 0) {
      throw new Error('No profile found. Please check your Wise account.');
    }

    this.cachedProfileId = profiles[0].id;
    console.log('✅ Profile ID:', this.cachedProfileId);
    return this.cachedProfileId;
  }

  async getBalances() {
    const profileId = await this.getProfileId();
    console.log('📡 Fetching balances for profile:', profileId);

    const balances = await this._request('get', `/v4/profiles/${profileId}/balances`);
    console.log('✅ Balances fetched:', balances.length);
    return balances;
  }

  async createQuote(sourceCurrency, targetCurrency, amount) {
    const profileId = await this.getProfileId();
    console.log('📡 Creating quote...');
    const quote = await this._request('post', '/v2/quotes', {
      profileId, sourceCurrency, targetCurrency, sourceAmount: amount, payOut: 'BALANCE'
    });
    console.log('✅ Quote created:', quote.id);
    return quote;
  }

  // ✅ CORRECTED METHOD - Uses the right endpoint from Wise docs
  async getBankDetails(currency = 'USD') {
    const profileId = await this.getProfileId();
    console.log('📡 Fetching bank details for currency:', currency);

    try {
      // Correct endpoint from Wise documentation [citation:3]
      const accountDetails = await this._request('get', `/v1/profiles/${profileId}/account-details`);
      console.log('✅ Account details response received');

      const details = accountDetails.find(acc => acc.currency === currency);

      if (details) {
        return {
          currency: details.currency,
          bankName: details.bankName || 'Wise',
          accountNumber: details.accountNumber || details.details?.accountNumber,
          sortCode: details.sortCode || details.details?.sortCode,
          iban: details.iban || details.details?.iban,
          swift: details.swiftCode || details.details?.swift,
          reference: 'USE_YOUR_REFERENCE_CODE'
        };
      }

      return {
        currency: currency,
        bankName: 'Wise',
        accountNumber: 'Generate bank details in Wise dashboard',
        sortCode: 'Request account details first',
        iban: 'Need to order bank details',
        swift: 'Contact support',
        reference: 'USE_YOUR_REFERENCE_CODE'
      };
    } catch (error) {
      console.error('Error fetching bank details:', error.message);
      return {
        currency: currency,
        bankName: 'Wise (Error)',
        accountNumber: 'Check Wise dashboard',
        sortCode: 'Contact support',
        iban: 'Need to set up account',
        swift: 'N/A',
        reference: 'USE_YOUR_REFERENCE_CODE'
      };
    }
  }
}

module.exports = new WiseService();