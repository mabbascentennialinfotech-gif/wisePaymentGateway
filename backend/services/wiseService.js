const axios = require('axios');

class WiseService {
  constructor() {
    this.apiUrl = process.env.WISE_API_URL || 'https://api.wise-sandbox.com';
    this.apiToken = process.env.WISE_API_TOKEN;
    this.cachedProfileId = null;
  }

  async _request(method, endpoint, data = null) {
    const config = {
      method,
      url: `${this.apiUrl}${endpoint}`,
      headers: { 'Authorization': `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' }
    };
    if (data) config.data = data;
    const response = await axios(config);
    return response.data;
  }

  async getProfileId() {
    if (this.cachedProfileId) return this.cachedProfileId;
    const profiles = await this._request('get', '/v2/profiles');
    this.cachedProfileId = profiles[0].id;
    return this.cachedProfileId;
  }

  async getBalances() {
    const profileId = await this.getProfileId();
    return await this._request('get', `/v4/profiles/${profileId}/balances`);
  }

  async createQuote(sourceCurrency, targetCurrency, amount) {
    const profileId = await this.getProfileId();
    return await this._request('post', '/v2/quotes', {
      profileId, sourceCurrency, targetCurrency, sourceAmount: amount, payOut: 'BALANCE'
    });
  }
}

module.exports = new WiseService();