// File: scripts/features/facebook_marketing_test.js

require('dotenv').config();
const facebookAPI = require('./facebook_marketing.api');
const sheetsExport = require('./google_sheets_export');

/**
 * Validate environment setup
 */
function validateEnvironment() {
  const requiredEnvVars = ['FACEBOOK_ACCESS_TOKEN'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}\nPlease create a .env file with these variables.`);
  }
}

/**
 * Test function to verify Facebook Marketing API functionality
 */
async function testFacebookMarketing() {
  console.log('🧪 Starting Facebook Marketing API test...');
  
  try {
    // First validate environment
    console.log('🔍 Validating environment setup...');
    validateEnvironment();
    console.log('✅ Environment validation passed');

    // Test parameters with new execution ID
    const testParams = {
      accountId: process.env.FACEBOOK_AD_ACCOUNT_ID || '2793124907466410',
      timeframe: 'last_30d',
      level: 'campaign',
      includeAudienceData: true,
      executionId: `test_${Date.now()}`  // Generate new execution ID
    };

    console.log(`📋 Test parameters:
- Account ID: ${testParams.accountId}
- Timeframe: ${testParams.timeframe}
- Level: ${testParams.level}
- Include Audience Data: ${testParams.includeAudienceData}
- Execution ID: ${testParams.executionId}
`);
    
    // 1. Test API connection
    console.log('🔍 Testing API connection...');
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('FACEBOOK_ACCESS_TOKEN is required');
    }
    console.log('✅ Access token validated');

    // 2. Test fetching active campaigns
    console.log('\n🔍 Testing fetchActiveCampaigns...');
    const campaigns = await facebookAPI.fetchActiveCampaigns(testParams.accountId);
    
    if (!campaigns) {
      throw new Error('Failed to fetch campaigns - no response received');
    }
    
    console.log(`✅ Found ${campaigns.length} active campaigns`);
    
    if (campaigns.length === 0) {
      console.log('⚠️ No active campaigns found to test with');
      return { success: false, error: 'No active campaigns found' };
    }

    // Log first campaign details for verification
    const firstCampaign = campaigns[0];
    console.log('\n📊 Sample campaign details:', {
      id: firstCampaign.id,
      name: firstCampaign.name,
      status: firstCampaign.status,
      effective_status: firstCampaign.effective_status
    });

    // 3. Test campaign insights for the first campaign
    const testCampaign = campaigns[0];
    console.log(`\n🔍 Testing campaign insights for: ${testCampaign.name} (${testCampaign.id})`);
    
    // Get campaign metadata and insights
    const metadata = await facebookAPI.getCampaignAnalysis(
      testParams.accountId,
      testCampaign.id,
      testParams.timeframe
    );
    
    if (!metadata || !metadata.analysis) {
      throw new Error('Failed to get campaign analysis - no data received');
    }
    
    console.log('\n📊 Campaign Analysis:', JSON.stringify(metadata, null, 2));

    // 4. Test Google Sheets export
    console.log('\n📊 Testing Google Sheets export...');
    const exportResult = await sheetsExport.exportToGoogleSheets({
      account_id: testParams.accountId,
      timestamp: new Date().toISOString(),
      timeframe: testParams.timeframe,
      summary: {
        total_campaigns: campaigns.length,
        campaigns_with_issues: 0,
        total_issues: 0
      },
      campaigns: [metadata.analysis]
    });
    console.log('📊 Google Sheets export result:', JSON.stringify(exportResult, null, 2));

    // 5. Test audience data retrieval if requested
    if (testParams.includeAudienceData) {
      console.log('\n👥 Testing audience data retrieval...');
      const audienceData = await facebookAPI.getAudienceData(testParams.accountId);
      if (!audienceData) {
        throw new Error('Failed to get audience data - no response received');
      }
      console.log(`✅ Retrieved audience data:`, JSON.stringify(audienceData, null, 2));
    }

    return {
      success: true,
      message: 'All tests completed successfully!',
      results: {
        campaignsFound: campaigns.length,
        hasMetadata: !!metadata,
        executionId: testParams.executionId,
        testTimestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('\nAPI Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    // Check for common issues
    if (error.message.includes('FACEBOOK_ACCESS_TOKEN')) {
      console.error('\n💡 Solution: Add your Facebook access token to .env file:');
      console.error('FACEBOOK_ACCESS_TOKEN=your_access_token_here');
    }
    
    if (error.message.includes('validation failed')) {
      console.error('\n💡 Solution: Check your .env file contains all required variables');
    }
    
    if (error.response?.status === 401) {
      console.error('\n💡 Solution: Your access token may be invalid or expired. Generate a new one.');
    }
    
    if (error.response?.status === 403) {
      console.error('\n💡 Solution: Check if your access token has the required permissions:');
      console.error('- ads_read');
      console.error('- ads_management');
    }

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testFacebookMarketing()
    .then(result => {
      console.log('\n🏁 Test completed:', result.success ? 'SUCCESS' : 'FAILED');
      console.log('📝 Results:', JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('\n💥 Fatal error during test:', err);
      console.error('\n💡 Troubleshooting steps:');
      console.error('1. Check your .env file exists and contains FACEBOOK_ACCESS_TOKEN');
      console.error('2. Verify your access token is valid and has required permissions');
      console.error('3. Check your network connection');
      console.error('4. Ensure your Ad Account ID is correct');
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = { testFacebookMarketing };
}