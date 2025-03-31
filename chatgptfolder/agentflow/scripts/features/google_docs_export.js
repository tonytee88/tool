/**
 * Google Docs Export Module
 * 
 * This module provides functionality to export content to Google Docs.
 * It uses a service account for authentication and creates a document that's shared
 * with "anyone with the link" for easy access.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Path to service account credentials file
// In production, use environment variables instead of a file path
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                         path.join(__dirname, '../../config/google-service-account.json');

/**
 * Get authenticated Google API client using service account
 * @returns {Promise<Object>} - Authenticated Google API client
 */
async function getAuthClient() {
  try {
    // Get credentials from environment variables
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      throw new Error('Missing Google service account credentials in environment variables');
    }
    
    // Create JWT client
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      [
        'https://www.googleapis.com/auth/documents',  // For creating/editing docs
        'https://www.googleapis.com/auth/drive.file'  // For managing file permissions
      ]
    );
    
    // Authorize the client
    await auth.authorize();
    console.log('✅ Google API client authenticated successfully');
    
    return auth;
  } catch (error) {
    console.error('❌ Error authenticating with Google:', error);
    throw error;
  }
}

/**
 * Export content to a Google Doc
 * @param {Object} options - Export options
 * @param {string} options.title - The title of the document
 * @param {string} options.content - The content to export
 * @param {string} [options.mimeType="text/plain"] - Content format (text/plain or text/html)
 * @returns {Promise<string>} - URL of the created document
 */
async function exportToGoogleDocs(options) {
  try {
    console.log('🔄 Starting export to Google Docs...');
    
    const { title, content, mimeType = 'text/plain' } = options;
    
    if (!title || !content) {
      throw new Error('Title and content are required');
    }
    
    // Get authenticated client
    const auth = await getAuthClient();
    
    // Initialize Google Docs and Drive APIs
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });
    
    // 1. Create a new document
    const document = await docs.documents.create({
      requestBody: {
        title: title
      }
    });
    
    const documentId = document.data.documentId;
    console.log(`✅ Created document: ${documentId}`);
    
    // 2. Insert content
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1 // Insert at the beginning of the document
              },
              text: content
            }
          }
        ]
      }
    });
    
    // 3. Set sharing permissions (anyone with link can view)
    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // 4. Get the shareable link
    const file = await drive.files.get({
      fileId: documentId,
      fields: 'webViewLink'
    });
    
    console.log(`✅ Document created and shared: ${file.data.webViewLink}`);
    
    return file.data.webViewLink;
  } catch (error) {
    console.error('❌ Error exporting to Google Docs:', error);
    throw error;
  }
}

/**
 * Format document with styling
 * @param {string} documentId - The document ID
 * @param {Object} formatting - Formatting options
 * @returns {Promise<void>}
 */
async function formatGoogleDoc(documentId, formatting) {
  try {
    // Get authenticated client
    const auth = await getAuthClient();
    
    // Initialize Google Docs API
    const docs = google.docs({ version: 'v1', auth });
    
    // Get document details to understand its structure
    const document = await docs.documents.get({
      documentId
    });
    
    // Prepare formatting requests
    const requests = [];
    
    // Example: Apply heading styles to title
    if (formatting.title) {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: 0,
            endIndex: document.data.title.length + 1
          },
          paragraphStyle: {
            namedStyleType: 'HEADING_1'
          },
          fields: 'namedStyleType'
        }
      });
    }
    
    // Example: Apply formatting to sections
    if (formatting.sections && formatting.sections.length > 0) {
      // This would need to analyze the document content to identify sections
      // and apply appropriate formatting
    }
    
    // Apply all formatting requests
    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests
        }
      });
      
      console.log('✅ Document formatting applied');
    }
  } catch (error) {
    console.error('❌ Error formatting Google Doc:', error);
    throw error;
  }
}

module.exports = {
  exportToGoogleDocs,
  formatGoogleDoc,
  getAuthClient
}; 