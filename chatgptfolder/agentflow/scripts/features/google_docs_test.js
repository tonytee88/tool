/**
 * Test script for Google Docs export
 */

const { exportToGoogleDocs } = require('./google_docs_export');

async function testGoogleDocsExport() {
  console.log('🧪 Testing Google Docs export...');
  
  try {
    // Test exporting some sample content
    const title = 'Test Document - ' + new Date().toISOString();
    const content = `# Test Document
    
This is a test document created by the Google Docs export utility.

## Features
- Creates a new Google Doc
- Inserts content
- Applies sharing permissions
- Returns a shareable link

## Example Code
\`\`\`javascript
const { exportToGoogleDocs } = require('./google_docs_export');

// Export content to a Google Doc
const docUrl = await exportToGoogleDocs({
  title: 'My Document',
  content: 'This is the content of my document'
});
\`\`\`

This document was generated on ${new Date().toLocaleString()}.
`;
    
    // Export to Google Docs
    const docUrl = await exportToGoogleDocs({
      title,
      content
    });
    
    console.log('📝 Document URL:', docUrl);
    console.log('✅ Test completed successfully');
    
    return docUrl;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testGoogleDocsExport()
    .then(url => {
      console.log('📝 Final Document URL:', url);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test error:', error);
      process.exit(1);
    });
}

module.exports = {
  testGoogleDocsExport
}; 