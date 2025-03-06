// File: scripts/features/facebook_marketing_test.js

require('dotenv').config();
const facebookAPI = require('./facebook_marketing.api');

/**
 * Test function to verify Facebook Marketing API functionality
 */
async function testFacebookMarketing() {
  console.log('🧪 Starting Facebook Marketing API test...');
  
  // Test parameters - replace with your test values
  const testParams = {
    accountId: '366302820479058', // From your example
    timeframe: 'last_30d',
    level: 'campaign',
    //includeAudienceData: true, 
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN // Store token in .env file
  };

  try {
    console.log(`📋 Test parameters: accountId=${testParams.accountId}, timeframe=${testParams.timeframe}`);
    
    // 1. Test the main workflow function
    console.log('🔍 Testing the main workflow function...');
    const result = await facebookAPI.fetchAndStoreInsights(testParams);
    
    if (result.success) {
      console.log('✅ Successfully fetched and stored insights!');
      console.log(`📊 Retrieved ${result.dataPoints} data points`);
      console.log('🔢 Sample metrics:', result.metrics);
      
      // 2. Verify data was stored by retrieving it
      console.log('🔍 Verifying data was stored correctly...');
      const storedData = await facebookAPI.getStoredInsightsData({
        accountId: testParams.accountId,
        timeframe: testParams.timeframe
      });
      
      console.log(`📚 Found ${storedData.length} records in the database`);
      if (storedData.length > 0) {
        console.log('🔍 Most recent record:', {
          retrievedAt: storedData[0].retrievedAt,
          insightId: storedData[0].insightId,
          metricCount: Object.keys(storedData[0].calculatedMetrics || {}).length
        });
      }
      
      return {
        success: true,
        message: 'All tests passed successfully!',
        result,
        storedDataCount: storedData.length
      };
    } else {
      throw new Error(result.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testFacebookMarketing()
    .then(result => {
      console.log('🏁 Test completed:', result.success ? 'SUCCESS' : 'FAILED');
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('💥 Fatal error during test:', err);
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = { testFacebookMarketing };
}