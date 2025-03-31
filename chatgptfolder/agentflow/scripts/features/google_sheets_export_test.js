/**
 * Test script for Google Sheets export functionality
 * 
 * This script tests the export of PACTO analysis reports to Google Sheets.
 */

const pactoAnalysis = require('./pacto_analysis');

/**
 * Test the Google Sheets export functionality
 */
async function testGoogleSheetsExport() {
  try {
    console.log('🔄 Starting Google Sheets export test...');
    
    // Test parameters
    const accountId = '1030162515542628'; // Replace with your test account ID
    const timeframe = 'last_30d';
    
    console.log(`📊 Generating and exporting PACTO analysis for account ${accountId}...`);
    
    // Generate and export the analysis report
    const result = await pactoAnalysis.generateAndExportAnalysisReport(accountId, timeframe);
    
    if (result.success) {
      console.log('✅ PACTO analysis successfully exported to Google Sheets!');
      console.log(`📋 Spreadsheet URL: ${result.spreadsheet_url}`);
      
      // Print some stats from the report
      console.log('\n📈 Report Summary:');
      console.log(`Total Campaigns: ${result.report.summary.total_campaigns}`);
      console.log(`Campaigns with Issues: ${result.report.summary.campaigns_with_issues}`);
      console.log(`Total Issues: ${result.report.summary.total_issues}`);
      
      return {
        success: true,
        spreadsheet_url: result.spreadsheet_url
      };
    } else {
      console.error(`❌ Failed to export PACTO analysis: ${result.error}`);
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ Error in Google Sheets export test:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGoogleSheetsExport()
    .then(result => {
      if (result.success) {
        console.log('✅ Test completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error in test:', error);
      process.exit(1);
    });
} else {
  // Export the test function if this script is imported as a module
  module.exports = {
    testGoogleSheetsExport
  };
} 