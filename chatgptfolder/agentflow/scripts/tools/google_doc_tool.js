/**
 * Google Doc Tool
 * 
 * This tool provides a way to export LLM output to Google Docs and return a shareable link.
 * It can be used as an output block in the UI or for Slack integrations.
 */

const { exportToGoogleDocs } = require('../features/google_docs_export');

/**
 * Export content to Google Docs and return a shareable link
 * @param {Object} params - Tool parameters
 * @param {string} params.content - The content to export
 * @param {string} [params.title] - Optional title (defaults to timestamp)
 * @param {string} [params.platform="browser"] - The platform where the result will be displayed (browser, slack, api)
 * @returns {Promise<Object>} - Result with shareable link
 */
async function googleDocTool(params) {
  try {
    console.log('🔄 Running Google Doc tool...');
    
    // Validate required params
    if (!params.content) {
      throw new Error('Content is required');
    }
    
    // Set default title if not provided
    const title = params.title || `Document - ${new Date().toISOString()}`;
    
    // Set platform (defaults to browser)
    const platform = params.platform || 'browser';
    
    // Export to Google Docs
    const docUrl = await exportToGoogleDocs({
      title,
      content: params.content
    });
    
    // Format response based on platform
    let response;
    switch (platform) {
      case 'slack':
        response = {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Document Created*\n\nI've created a Google Doc with your content. <${docUrl}|Click here to view it>.`
              }
            }
          ]
        };
        break;
        
      case 'api':
        response = {
          success: true,
          message: 'Document created successfully',
          url: docUrl
        };
        break;
        
      case 'browser':
      default:
        response = {
          html: `
            <div class="google-doc-result">
              <h3>Document Created</h3>
              <p>Your content has been exported to a Google Doc.</p>
              <p><a href="${docUrl}" target="_blank" class="btn btn-primary">View Document</a></p>
            </div>
          `,
          url: docUrl
        };
        break;
    }
    
    console.log(`✅ Google Doc created: ${docUrl}`);
    
    return {
      success: true,
      response,
      url: docUrl
    };
  } catch (error) {
    console.error('❌ Google Doc tool error:', error);
    
    return {
      success: false,
      error: error.message,
      response: {
        html: `<div class="alert alert-danger">Error creating Google Doc: ${error.message}</div>`,
        message: `Error creating Google Doc: ${error.message}`
      }
    };
  }
}

module.exports = googleDocTool; 