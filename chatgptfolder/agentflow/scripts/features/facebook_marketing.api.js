const axios = require('axios');
require('dotenv').config();

// Add validation for required environment variable
function validateEnvironment() {
  if (!process.env.FACEBOOK_ACCESS_TOKEN) {
    throw new Error('FACEBOOK_ACCESS_TOKEN environment variable is required');
  }
  return process.env.FACEBOOK_ACCESS_TOKEN;
}

/**
 * Calls the Facebook Marketing API to retrieve comprehensive insights data
 * @param {Object} params - Parameters for the API call
 * @param {string} params.accountId - Facebook Ad Account ID (without 'act_' prefix)
 * @param {string} params.timeframe - Date preset (last_7d, last_30d, etc.)
 * @param {string} params.accessToken - Facebook API access token
 * @param {string} [params.level] - Data aggregation level: 'account', 'campaign', 'adset', or 'ad'
 * @returns {Promise<Object>} - The API response data
 */
async function callFacebookInsightsAPI(params) {
  try {
    const accessToken = validateEnvironment();
    console.log(`📊 Calling Facebook Insights API for account ${params.accountId} with timeframe ${params.timeframe}`);
    
    // All metrics we want to collect based on Facebook API field names
    // Researched these field names from Facebook Marketing API documentation
    const fields = [
      // Standard metrics
      'spend',                     // Amount spent
      'impressions',               // Views
      'clicks',                    // Clicks  
      'reach',                     // Number of unique people who saw ads
      'frequency',                 // Ad frequency (avg times a person saw ad)
      
      // Campaign info
      'campaign_name',             // Campaign name
      
      // Audience metrics
      'estimated_ad_recallers',    // People likely to remember your ads
      
      // Performance metrics
      'ctr',                       // Click-through rate
      'cpc',                       // Cost per click
      'cost_per_action_type',      // Cost per various actions (includes CPA)
      'cost_per_thruplay',         // Cost per video view
      'cost_per_unique_click',     // Cost per unique click
      'purchase_roas',             // Return on ad spend
      'cpp',                       // Cost per 1,000 people reached
      'cpm',                       // Cost per 1,000 impressions
      
      // Conversion metrics
      'actions',                   // All conversion actions (includes ATC - add to cart)
      'conversions',               // Conversion data
      
      // Date information
      'date_start',                // Start date
      'date_stop'                  // End date
    ].join(',');
    
    // Construct the API URL
    const url = `https://graph.facebook.com/v17.0/act_${params.accountId}/insights`;
    
    // Make the API request using the environment variable token
    const response = await axios.get(url, {
      params: {
        fields: fields,
        level: params.level || 'account',
        date_preset: params.timeframe,
        access_token: accessToken,
        limit: 100
      }
    });
    
    console.log(`✅ Successfully retrieved Facebook insights data for account ${params.accountId}`);
    //console.log(JSON.stringify(response.data, null, 2))
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling Facebook API: ${error.message}`);
    if (error.response) {
      console.error('Error details:', error.response.data?.error || error.response.data);
    }
    throw new Error(`Facebook API Error: ${error.message}`);
  }
}

/**
 * Fetches additional audience data including size and exclusions
 * @param {string} accountId - Facebook Ad Account ID
 * @param {string} accessToken - Facebook API access token
 * @returns {Promise<Object>} - Audience data
 */
async function getAudienceData(accountId) {
  try {
    const accessToken = validateEnvironment();
    console.log(`👥 Fetching audience data for account ${accountId}`);
    
    // Get audience data from the ad account's saved audiences
    const url = `https://graph.facebook.com/v17.0/act_${accountId}/saved_audiences`;
    
    const response = await axios.get(url, {
      params: {
        fields: 'name,description,approximate_count_lower_bound,approximate_count_upper_bound,rule,exclusions,inclusions',
        access_token: accessToken
      }
    });
    
    console.log(`✅ Successfully retrieved audience data for account ${accountId}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching audience data: ${error.message}`);
    if (error.response) {
      console.error('Error details:', error.response.data?.error || error.response.data);
    }
    // Return empty result instead of throwing to prevent blocking the main data flow
    return { data: [] };
  }
}

/**
 * Formats and enriches the API response data
 * @param {Object} insightsData - Facebook insights API response
 * @param {Object} audienceData - Facebook audience data (optional)
 * @param {Object} metadata - Additional request metadata
 * @returns {Object} - Formatted and enriched data
 */
function formatInsightsData(insightsData, audienceData, metadata) {
  console.log(`🔄 Formatting insights data for storage`);
  
  const formattedData = {
    accountId: metadata.accountId,
    timeframe: metadata.timeframe,
    level: metadata.level || 'account',
    retrievedAt: new Date().toISOString(),
    insights: insightsData.data || [],
    audienceData: audienceData?.data || [],
    calculatedMetrics: {},
    raw: {
      insightsPaging: insightsData.paging || null,
      audiencePaging: audienceData?.paging || null
    }
  };
  
  // Calculate additional metrics not directly provided by Facebook
  if (insightsData.data && insightsData.data.length > 0) {
    const primaryInsight = insightsData.data[0];
    const metrics = {};
    
    // Extract numeric values
    const spend = parseFloat(primaryInsight.spend || 0);
    const impressions = parseInt(primaryInsight.impressions || 0);
    const clicks = parseInt(primaryInsight.clicks || 0);
    const reach = parseInt(primaryInsight.reach || 0);
    
    // Basic metrics
    metrics.spend = spend;
    metrics.impressions = impressions;
    metrics.clicks = clicks;
    metrics.reach = reach;
    
    // CPC - Cost Per Click
    metrics.cpc = clicks > 0 ? (spend / clicks) : 0;
    
    // CPM - Cost Per 1000 Impressions
    metrics.cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    
    // CTR - Click Through Rate (%)
    metrics.ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    // Frequency - Average times a person saw the ad
    metrics.frequency = parseFloat(primaryInsight.frequency || 0);
    
    // Extract "Add to Cart" events if available
    if (primaryInsight.actions) {
      const atcAction = primaryInsight.actions.find(a => 
        a.action_type === 'add_to_cart' || a.action_type === 'offsite_conversion.add_to_cart');
        
      if (atcAction) {
        metrics.atc = parseInt(atcAction.value || 0);
        metrics.atc_rate = impressions > 0 ? (metrics.atc / impressions) * 100 : 0;
        metrics.cost_per_atc = metrics.atc > 0 ? spend / metrics.atc : 0;
      }
    }
    
    // Extract ROAS if available
    if (primaryInsight.purchase_roas) {
      const roasData = primaryInsight.purchase_roas[0];
      if (roasData) {
        metrics.roas = parseFloat(roasData.value || 0);
      }
    }
    
    // Store calculated metrics
    formattedData.calculatedMetrics = metrics;
  }
  
  return formattedData;
}

/**
 * Stores the Facebook insights data using the MongoDB Data API
 * @param {Object} formattedData - The formatted insights data
 * @returns {Promise<Object>} - The result of the database operation
 */
async function storeInsightsData(insightsData) {
  try {
    console.log(`📡 Storing Facebook insights data to MongoDB...`);
    
    const response = await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
      operation: 'save_facebook_insights', // Match the case in your switch statement
      collection: 'facebook_insights',
      flowData: insightsData,  // Match the format of your other save operations
      metadata: {
        timestamp: new Date().toISOString(),
        accountId: insightsData.accountId
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      throw new Error('No response from MongoDB storage endpoint');
    }

    console.log(`✅ Successfully stored Facebook insights data`);
    return response.data;

  } catch (error) {
    console.error('❌ Error storing Facebook insights:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}

/**
 * Retrieves previously stored insights data
 * @param {Object} query - Query parameters (accountId, timeframe)
 * @returns {Promise<Array>} - Array of matching insights data
 */
async function getStoredInsightsData(query = {}) {
  try {
    console.log(`📡 Fetching Facebook insights data from MongoDB...`);
    const response = await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
      operation: 'get_facebook_insights',
      collection: 'facebook_insights',
      filter: query  // Match your other get operations format
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data) {
      console.warn(`⚠️ No insights data found for query:`, query);
      return null;
    }

    console.log(`✅ Successfully retrieved Facebook insights data`);
    return response.data;

  } catch (error) {
    console.error('❌ Error fetching Facebook insights:', error);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}

/**
 * Main function to fetch, process and store Facebook Marketing insights
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Result of the operation
 */
async function fetchAndStoreInsights(options) {
  try {
    if (!options.executionId) {
      throw new Error('executionId is required for Facebook insights processing');
    }

    console.log(`🚀 Starting Facebook insights retrieval for account ${options.accountId} (executionId: ${options.executionId})`);
    
    // Step 1: Call the Facebook Insights API (no longer passing access token)
    const insightsData = await callFacebookInsightsAPI({
      accountId: options.accountId,
      timeframe: options.timeframe,
      level: options.level || 'account'
    });
    
    // Step 2: Get audience data if requested (no longer passing access token)
    let audienceData = null;
    if (options.includeAudienceData) {
      audienceData = await getAudienceData(options.accountId);
    }
    
    // Step 3: Format and enrich the data
    const formattedData = formatInsightsData(insightsData, audienceData, {
      accountId: options.accountId,
      timeframe: options.timeframe,
      level: options.level || 'account',
      executionId: options.executionId
    });
    
    formattedData.executionId = options.executionId;
    
    // Step 4: Store the data in MongoDB
    const storageResult = await storeInsightsData(formattedData);
    
    return {
      success: true,
      message: 'Facebook insights retrieved and stored successfully',
      executionId: options.executionId,
      metrics: formattedData.calculatedMetrics,
      dataPoints: insightsData.data?.length || 0
    };
  } catch (error) {
    console.error(`❌ Error in Facebook insights processing: ${error.message}`);
    return {
      success: false,
      error: error.message,
      executionId: options.executionId
    };
  }
}

module.exports = {
  callFacebookInsightsAPI,
  getAudienceData,
  formatInsightsData,
  storeInsightsData,
  getStoredInsightsData,
  fetchAndStoreInsights
};