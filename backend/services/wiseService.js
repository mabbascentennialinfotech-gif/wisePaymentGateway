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
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
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

  async getBankDetails(currency = 'USD') {
    const profileId = await this.getProfileId();
    console.log('📡 Fetching bank details for:', currency);

    // Return mock data for sandbox (works on Render)
    return {
      currency: currency,
      bankName: 'Wise',
      accountNumber: '12345678',
      sortCode: '04-00-04',
      iban: 'GB00WISE1234567890',
      swift: 'WISEGB2L',
      reference: `RESUME_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    };
  }
}

module.exports = new WiseService();