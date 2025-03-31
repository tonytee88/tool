/**
 * Test script for Google Doc tool
 */

const googleDocTool = require('./google_doc_tool');

async function testGoogleDocTool() {
  console.log('🧪 Testing Google Doc tool...');
  
  try {
    // Test with browser platform
    console.log('\n📝 Testing browser platform:');
    const browserResult = await googleDocTool({
      title: 'Browser Test - ' + new Date().toISOString(),
      content: '# Browser Platform Test\n\nThis is a test of the Google Doc tool with browser platform.',
      platform: 'browser'
    });
    
    console.log('✅ Browser test result:', browserResult.success);
    console.log('📄 Document URL:', browserResult.url);
    
    // Test with Slack platform
    console.log('\n📝 Testing Slack platform:');
    const slackResult = await googleDocTool({
      title: 'Slack Test - ' + new Date().toISOString(),
      content: '# Slack Platform Test\n\nThis is a test of the Google Doc tool with Slack platform.',
      platform: 'slack'
    });
    
    console.log('✅ Slack test result:', slackResult.success);
    console.log('📄 Document URL:', slackResult.url);
    console.log('🔍 Slack blocks:', JSON.stringify(slackResult.response.blocks, null, 2));
    
    // Test with API platform
    console.log('\n📝 Testing API platform:');
    const apiResult = await googleDocTool({
      title: 'API Test - ' + new Date().toISOString(),
      content: '# API Platform Test\n\nThis is a test of the Google Doc tool with API platform.',
      platform: 'api'
    });
    
    console.log('✅ API test result:', apiResult.success);
    console.log('📄 Document URL:', apiResult.url);
    
    return {
      browserUrl: browserResult.url,
      slackUrl: slackResult.url,
      apiUrl: apiResult.url
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGoogleDocTool()
    .then(results => {
      console.log('\n🏁 All tests completed successfully');
      console.log('📄 Browser URL:', results.browserUrl);
      console.log('📄 Slack URL:', results.slackUrl);
      console.log('📄 API URL:', results.apiUrl);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test error:', error);
      process.exit(1);
    });
}

module.exports = {
  testGoogleDocTool
}; 