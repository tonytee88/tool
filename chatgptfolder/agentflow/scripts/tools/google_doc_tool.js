/**
 * Google Doc Tool
 * 
 * This tool provides a way to export LLM output to Google Docs and return a shareable link.
 * It can be used as an output block in the UI or for Slack integrations.
 */

const { exportToGoogleDocs } = require('../features/google_docs_export');

/**
 * Export content to Google Docs and return a shareable link
 * @param {Object} params - Parameters for the tool
 * @param {string} params.content - Content to export
 * @param {string} [params.title] - Optional title for the document
 * @param {string} [params.platform="browser"] - Platform type (slack/browser)
 * @returns {Promise<Object>} - Response containing the document link
 */
async function googleDocTool(params) {
  const { content, title, platform = "browser" } = params;
  
  if (!content) {
    throw new Error("Content is required for Google Doc export");
  }

  try {
    // Generate a default title if none provided
    const docTitle = title || `Document ${new Date().toISOString().split('T')[0]}`;
    
    // Call the export function
    const link = await exportToGoogleDocs({
      title: docTitle,
      content: content,
      mimeType: "text/plain"
    });

    // Format response based on platform
    const response = platform === "slack" 
      ? `✅ Document created and shared: ${link}`
      : link;

    return {
      success: true,
      response,
      link // Add the link to the response
    };
  } catch (error) {
    console.error("Error in googleDocTool:", error);
    throw error;
  }
}

module.exports = googleDocTool; 