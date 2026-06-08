require('dotenv').config();
const wiseService = require('./services/wiseService');

async function test() {
  try {
    console.log('🚀 Testing Wise Service...\n');

    // Test 1: Get profile
    const profileId = await wiseService.getProfileId();
    console.log('✅ Profile ID:', profileId);

    // Test 2: Get balances
    const balances = await wiseService.getBalances();
    console.log('✅ Balances:', balances);

    // Test 3: Create a quote
    const quote = await wiseService.createQuote('USD', 'GBP', 100);
    console.log('✅ Quote:', {
      id: quote.id,
      rate: quote.rate,
      fee: quote.fee,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount
    });

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();