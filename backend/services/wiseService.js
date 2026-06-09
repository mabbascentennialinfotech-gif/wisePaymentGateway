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

  async getBalanceForCurrency(currency) {
    const balances = await this.getBalances();
    const balance = balances.find(b => b.currency === currency);
    return balance || { currency, amount: 0, reservedAmount: 0 };
  }

  async hasEnoughBalance(currency, amount) {
    const balance = await this.getBalanceForCurrency(currency);
    return balance.amount >= amount;
  }

  async createQuote(sourceCurrency, targetCurrency, amount, isSourceAmount = true) {
    const profileId = await this.getProfileId();

    const payload = {
      profileId,
      sourceCurrency,
      targetCurrency,
      payOut: 'BALANCE'
    };

    if (isSourceAmount) {
      payload.sourceAmount = amount;
    } else {
      payload.targetAmount = amount;
    }

    console.log('📡 Creating quote...');
    const quote = await this._request('post', '/v2/quotes', payload);
    console.log('✅ Quote created:', quote.id);

    return quote;
  }

  async createTransfer(recipientId, quoteId, reference) {
    const profileId = await this.getProfileId();

    const payload = {
      profileId,
      quoteId,
      targetAccountId: recipientId,
      details: {
        reference: reference || `Transfer ${Date.now()}`
      }
    };

    console.log('📡 Creating transfer...');
    const transfer = await this._request('post', '/v1/transfers', payload);
    console.log('✅ Transfer created:', transfer.id);

    return transfer;
  }

  async fundTransfer(transferId) {
    const profileId = await this.getProfileId();

    const payload = {
      profileId,
      transferId,
      type: 'BALANCE'
    };

    console.log('📡 Funding transfer...');
    const funding = await this._request('post', '/v3/transfers/transfer-fund', payload);
    console.log('✅ Transfer funded:', funding.status);

    return funding;
  }

  async getTransferStatus(transferId) {
    const profileId = await this.getProfileId();

    const transfer = await this._request('get', `/v1/transfers/${transferId}`);
    console.log('📡 Transfer status:', transfer.status);

    return transfer;
  }

  async getExchangeRates(sourceCurrency, targetCurrency) {
    const rates = await this._request('get', `/v1/rates?source=${sourceCurrency}&target=${targetCurrency}`);
    return rates;
  }

  // ✅ THIS IS THE METHOD YOUR FRONTEND IS CALLING
  async getBankDetails(currency = 'USD') {
    const profileId = await this.getProfileId();
    console.log('📡 Fetching bank details for currency:', currency);

    try {
      // Try to get real account details from Wise
      const accounts = await this._request('get', `/v1/borderless-accounts?profileId=${profileId}`);

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        return {
          currency: currency,
          bankName: account.bankName || 'Wise',
          accountNumber: account.accountNumber || '12345678',
          sortCode: account.sortCode || '04-00-04',
          iban: account.iban || 'GB00WISE1234567890',
          swift: account.swiftCode || 'WISEGB2L',
          reference: 'USE_YOUR_REFERENCE_CODE'
        };
      }
    } catch (error) {
      console.log('Could not fetch real account details, using mock data:', error.message);
    }

    // Return mock data for sandbox/testing
    return {
      currency: currency,
      bankName: 'Wise (Sandbox)',
      accountNumber: '12345678',
      sortCode: '04-00-04',
      iban: `GB${Math.floor(Math.random() * 100000000000000)}`,
      swift: 'WISESANDBOX',
      reference: 'USE_YOUR_REFERENCE_CODE'
    };
  }
}

module.exports = new WiseService();