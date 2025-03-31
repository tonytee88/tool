require('dotenv').config();
const facebookAPI = require('./facebook_marketing.api');

/**
 * Test function to demonstrate the campaign analysis functionality
 */
async function testCampaignAnalysis() {
  console.log('🧪 Starting Facebook Campaign Analysis test...');
  
  // Test parameters - replace with your test values
  const testParams = {
    accountId: '1030162515542628',
    timeframe: 'last_30d',
    executionId: 'analysis-test-' + Date.now()
  };

  try {
    console.log(`📋 Test parameters: accountId=${testParams.accountId}, timeframe=${testParams.timeframe}`);
    
    // 1. First, fetch and store insights to ensure we have data
    console.log('🔍 Fetching and storing insights data...');
    const fetchResult = await facebookAPI.fetchAndStoreInsights(testParams);
    
    if (!fetchResult.success) {
      throw new Error(fetchResult.error || 'Failed to fetch insights');
    }
    
    console.log(`✅ Successfully fetched and stored insights for ${fetchResult.dataPoints} data points`);
    
    // 2. Get the first campaign ID from the stored data
    console.log('🔍 Retrieving stored insights data to get campaign IDs...');
    const storedData = await facebookAPI.getStoredInsightsData({
      accountId: testParams.accountId,
      timeframe: testParams.timeframe
    });
    
    if (!storedData || storedData.length === 0) {
      throw new Error('No stored data found');
    }
    
    console.log('📊 Retrieved stored data:', JSON.stringify(storedData[0].insights ? 
      { insightsCount: storedData[0].insights.length } : 
      { noInsights: true }, null, 2));
    
    // Extract campaign ID from insights data
    let campaignId;
    if (storedData[0].insights && storedData[0].insights.length > 0) {
      campaignId = storedData[0].insights[0].campaign_metadata?.id;
      console.log(`📊 Found campaign ID from insights: ${campaignId}`);
    } else if (storedData[0].analysisResults && storedData[0].analysisResults.length > 0) {
      campaignId = storedData[0].analysisResults[0].campaign_id;
      console.log(`📊 Found campaign ID from analysis results: ${campaignId}`);
    } else {
      throw new Error('No campaign information found in stored data');
    }
    
    if (!campaignId) {
      throw new Error('Could not extract campaign ID from stored data');
    }
    
    // 3. Get detailed analysis for the campaign
    console.log(`🔍 Getting detailed analysis for campaign ${campaignId}...`);
    const analysisResult = await facebookAPI.getCampaignAnalysis(
      testParams.accountId,
      campaignId,
      testParams.timeframe
    );
    
    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'Failed to get campaign analysis');
    }
    
    // 4. Display the analysis results
    console.log('✅ Successfully retrieved campaign analysis:');
    console.log('Campaign:', analysisResult.analysis.campaign_name);
    console.log('Source:', analysisResult.source);
    console.log('Timestamp:', analysisResult.timestamp);
    
    // Display metrics
    console.log('\n📊 Campaign Metrics:');
    console.log('- Spend:', analysisResult.analysis.metrics.spend);
    console.log('- Impressions:', analysisResult.analysis.metrics.impressions);
    console.log('- Clicks:', analysisResult.analysis.metrics.clicks);
    console.log('- CTR:', analysisResult.analysis.metrics.ctr);
    
    // Display attribution window
    console.log('\n🔄 Attribution Window:');
    console.log('- Value:', analysisResult.analysis.attribution_window.value);
    console.log('- Analysis:', analysisResult.analysis.attribution_window.analysis);
    console.log('- Recommendation:', analysisResult.analysis.attribution_window.recommendation);
    
    // Display campaign age
    console.log('\n📅 Campaign Age:');
    console.log('- Start Time:', analysisResult.analysis.campaign_age.start_time);
    console.log('- Age (months):', analysisResult.analysis.campaign_age.age_months);
    console.log('- Analysis:', analysisResult.analysis.campaign_age.analysis);
    console.log('- Recommendation:', analysisResult.analysis.campaign_age.recommendation);
    
    // Display placements
    console.log('\n📍 Placements:');
    console.log('- Automatic:', analysisResult.analysis.placements.is_automatic);
    console.log('- Analysis:', analysisResult.analysis.placements.analysis);
    console.log('- Recommendation:', analysisResult.analysis.placements.recommendation);
    
    // Display optimization
    console.log('\n🎯 Optimization:');
    console.log('- Goals:', analysisResult.analysis.optimization.goals);
    console.log('- Analysis:', analysisResult.analysis.optimization.analysis);
    console.log('- Recommendation:', analysisResult.analysis.optimization.recommendation);
    
    // Display ad sets summary
    console.log('\n📦 Ad Sets:');
    console.log('- Count:', analysisResult.analysis.ad_sets.length);
    
    // Display first ad set details
    if (analysisResult.analysis.ad_sets.length > 0) {
      const firstAdSet = analysisResult.analysis.ad_sets[0];
      console.log('\n📦 First Ad Set Details:');
      console.log('- Name:', firstAdSet.adset_name);
      console.log('- Optimization Goal:', firstAdSet.optimization_goal);
      console.log('- Status:', firstAdSet.status);
      console.log('- Audience Analysis:', firstAdSet.audience.analysis);
      console.log('- Audience Recommendation:', firstAdSet.audience.recommendation);
      
      // Display ads summary
      console.log('- Ads Count:', firstAdSet.ads.length);
      
      // Display first ad details
      if (firstAdSet.ads.length > 0) {
        const firstAd = firstAdSet.ads[0];
        console.log('\n📝 First Ad Details:');
        console.log('- Name:', firstAd.ad_name);
        console.log('- Status:', firstAd.status);
        console.log('- Creative Analysis:', firstAd.creative.analysis);
        console.log('- Creative Recommendation:', firstAd.creative.recommendation);
      }
    }
    
    return {
      success: true,
      message: 'Campaign analysis test completed successfully',
      campaignId,
      analysis: analysisResult
    };
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
  testCampaignAnalysis()
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
  module.exports = { testCampaignAnalysis };
} 