require('dotenv').config();
const pactoAnalysis = require('./pacto_analysis');

/**
 * Test function to demonstrate the PACTO analysis functionality
 */
async function testPactoAnalysis() {
  console.log('🧪 Starting PACTO Analysis test...');
  
  // Test parameters - replace with your test values
  const testParams = {
    accountId: '1030162515542628',
    timeframe: 'last_30d'
  };

  try {
    console.log(`📋 Test parameters: accountId=${testParams.accountId}, timeframe=${testParams.timeframe}`);
    
    // Generate the analysis report
    console.log('🔍 Generating PACTO analysis report...');
    const result = await pactoAnalysis.generateAnalysisReport(testParams);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate analysis report');
    }
    
    const report = result.report;
    
    // Display summary
    console.log('\n📊 Analysis Summary:');
    console.log(`- Total Campaigns: ${report.summary.total_campaigns}`);
    console.log(`- Campaigns with Issues: ${report.summary.campaigns_with_issues}`);
    console.log(`- Total Issues: ${report.summary.total_issues}`);
    
    // Display campaign details
    console.log('\n📋 Campaign Details:');
    
    for (const campaign of report.campaigns) {
      console.log(`\n🔍 Campaign: ${campaign.campaign_name} (${campaign.campaign_id})`);
      console.log(`- Status: ${campaign.overall_status}`);
      
      // Display campaign metrics
      console.log('- Metrics:');
      for (const metric of campaign.metrics) {
        console.log(`  - ${metric.name}: ${metric.status}`);
        if (metric.status === 'NOT OK') {
          console.log(`    - Reason: ${metric.reason}`);
          console.log(`    - Recommendation: ${metric.recommendation}`);
        }
      }
      
      // Display ad sets
      if (campaign.ad_sets.length > 0) {
        console.log(`- Ad Sets (${campaign.ad_sets.length}):`);
        
        for (const adSet of campaign.ad_sets) {
          console.log(`  - ${adSet.adset_name} (${adSet.adset_id}):`);
          
          // Display ad set metrics
          for (const metric of adSet.metrics) {
            console.log(`    - ${metric.name}: ${metric.status}`);
            if (metric.status === 'NOT OK') {
              console.log(`      - Reason: ${metric.reason}`);
              console.log(`      - Recommendation: ${metric.recommendation}`);
            }
          }
          
          // Display ads
          if (adSet.ads.length > 0) {
            console.log(`    - Ads (${adSet.ads.length}):`);
            
            for (const ad of adSet.ads) {
              console.log(`      - ${ad.ad_name} (${ad.ad_id}):`);
              
              // Display ad metrics
              for (const metric of ad.metrics) {
                console.log(`        - ${metric.name}: ${metric.status}`);
                if (metric.status === 'NOT OK') {
                  console.log(`          - Reason: ${metric.reason}`);
                  console.log(`          - Recommendation: ${metric.recommendation}`);
                }
              }
            }
          }
        }
      }
    }
    
    // Also test the specific campaign analysis
    if (report.campaigns.length > 0) {
      const firstCampaignId = report.campaigns[0].campaign_id;
      console.log(`\n🔍 Testing specific campaign analysis for ${firstCampaignId}...`);
      
      const campaignResult = await pactoAnalysis.getCampaignAnalysis({
        accountId: testParams.accountId,
        campaignId: firstCampaignId,
        timeframe: testParams.timeframe
      });
      
      if (!campaignResult.success) {
        throw new Error(campaignResult.error || 'Failed to get specific campaign analysis');
      }
      
      console.log(`✅ Successfully retrieved specific campaign analysis for ${firstCampaignId}`);
    }
    
    return {
      success: true,
      message: 'PACTO analysis test completed successfully',
      report
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
  testPactoAnalysis()
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
  module.exports = { testPactoAnalysis };
} 