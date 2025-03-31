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
 * Fetches all active campaigns for a given ad account
 * @param {string} accountId - Facebook Ad Account ID
 * @returns {Promise<Array>} - Array of active campaigns
 */
async function fetchActiveCampaigns(accountId) {
  try {
    const accessToken = validateEnvironment();
    console.log(`📊 Fetching active campaigns for account ${accountId}`);
    
    let allCampaigns = [];
    let nextPageUrl = `https://graph.facebook.com/v19.0/act_${accountId}/campaigns?fields=id,name,effective_status,status,start_time&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]&access_token=${accessToken}&limit=100`;

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl);
      console.log(`🔍 Retrieved campaigns page with ${response.data.data?.length || 0} campaigns`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log(`🔍 First campaign in response:`, response.data.data[0]);
      }
      
      allCampaigns = allCampaigns.concat(response.data.data || []);

      // Check for next page
      nextPageUrl = response.data.paging?.next || null;
    }
    
    console.log(`✅ Successfully retrieved ${allCampaigns.length} active campaigns`);
    return allCampaigns;
  } catch (error) {
    console.error(`❌ Error fetching active campaigns: ${error.message}`);
    if (error.response) {
      console.error('Error details:', error.response.data?.error || error.response.data);
    }
    throw new Error(`Facebook API Error: ${error.message}`);
  }
}

/**
 * Calls the Facebook Marketing API to retrieve insights data for each active campaign
 * @param {Array} campaigns - Array of active campaigns
 * @param {Object} params - Parameters for the API call
 * @returns {Promise<Array>} - Array of insights data
 */
async function fetchCampaignInsights(campaigns, params) {
  try {
    const accessToken = validateEnvironment();
    let allInsights = [];

    for (const campaign of campaigns) {
      console.log(`📊 Fetching insights for campaign ${campaign.id}`);
      
      // First, get detailed campaign metadata including budget information
      const campaignMetadata = await axios.get(`https://graph.facebook.com/v19.0/${campaign.id}`, {
        params: {
          fields: 'id,name,start_time,status,budget_remaining,daily_budget,lifetime_budget,objective,special_ad_categories,bid_strategy,attribution_spec',
          access_token: accessToken
        }
      });
      
      console.log(`🔍 Retrieved campaign metadata for ${campaign.id}:`, campaignMetadata.data);
      
      // Get ad sets with more detailed fields
      const adSets = await axios.get(`https://graph.facebook.com/v19.0/${campaign.id}/adsets`, {
        params: {
          fields: 'id,name,optimization_goal,promoted_object,targeting,bid_amount,billing_event,status,placements,attribution_spec',
          access_token: accessToken
        }
      });
      
      console.log(`🔍 Retrieved ${adSets.data.data?.length || 0} ad sets for campaign ${campaign.id}`);
      
      // Get ads for this campaign to analyze creatives
      const ads = await axios.get(`https://graph.facebook.com/v19.0/${campaign.id}/ads`, {
      params: {
          fields: 'id,name,creative,status,adset_id',
          access_token: accessToken
        }
      });
      
      console.log(`🔍 Retrieved ${ads.data.data?.length || 0} ads for campaign ${campaign.id}`);
      
      // Then get insights data
      let nextPageUrl = `https://graph.facebook.com/v19.0/${campaign.id}/insights?fields=spend,impressions,clicks,reach,frequency,ctr,cpc,cpp,cpm,actions,conversions,cost_per_action_type,cost_per_conversion,conversion_rate_ranking,action_values,attribution_window,estimated_ad_recallers,cost_per_estimated_ad_recallers,estimated_ad_recall_rate,purchase_roas,date_start,date_stop&date_preset=${params.timeframe}&access_token=${accessToken}&limit=100`;

      while (nextPageUrl) {
        const response = await axios.get(nextPageUrl);
        console.log(`🔍 Retrieved insights page for campaign ${campaign.id}:`, response.data);
        
        // Add campaign metadata to each insight
        if (response.data.data && response.data.data.length > 0) {
          response.data.data.forEach(insight => {
            insight.campaign_metadata = campaignMetadata.data;
            insight.ad_sets = adSets.data.data || [];
            insight.ads = ads.data.data || [];
            
            // Count audiences and creatives
            const audienceCount = new Set(insight.ad_sets.map(adset => JSON.stringify(adset.targeting || {}))).size;
            const creativeCount = new Set(insight.ads.map(ad => ad.creative?.id || '')).size;
            
            insight.audience_count = audienceCount;
            insight.creative_count = creativeCount;
            
            // Check if placements are automatic
            const hasManualPlacements = insight.ad_sets.some(adset => 
              adset.placements && 
              !adset.placements.includes('automatic_placements')
            );
            
            insight.has_automatic_placements = !hasManualPlacements;
            
            // Get optimization goals
            insight.optimization_goals = [...new Set(insight.ad_sets.map(adset => adset.optimization_goal || ''))];
          });
        }
        
        allInsights = allInsights.concat(response.data.data || []);

        // Check for next page
        nextPageUrl = response.data.paging?.next || null;
      }
    }

    return allInsights;
  } catch (error) {
    console.error(`❌ Error fetching campaign insights: ${error.message}`);
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
async function formatInsightsData(campaignId, insights, metadata, adSets) {
  if (!insights || !metadata) {
    console.warn('⚠️ No insights or metadata available to format');
    return {
      level: 'campaign',
      retrievedAt: new Date().toISOString(),
      insights: [],
      calculatedMetrics: {
        total_campaigns: 0,
        campaigns_with_issues: 0,
        total_issues: 0
      },
      analysisResults: []
    };
  }

  // Calculate total budget from ad sets
  const adSetBudgets = adSets.data?.reduce((acc, adSet) => {
    acc.daily += parseFloat(adSet.daily_budget || 0);
    acc.lifetime += parseFloat(adSet.lifetime_budget || 0);
    acc.remaining += parseFloat(adSet.budget_remaining || 0);
    return acc;
  }, { daily: 0, lifetime: 0, remaining: 0 });

  // Extract metrics
  const extractedMetrics = {
    attribution_windows: {
      value: {
        default: '7d_click and 1d_view',
        actions: insights.data?.[0]?.actions?.map(action => ({
          type: action.action_type,
          windows: {
            '1d_click': action['1d_click'],
            '1d_view': action['1d_view'],
            '7d_click': action['7d_click']
          }
        })) || []
      },
      source: 'insights'
    },
    budget: {
      campaign_level: {
        daily_budget: parseFloat(metadata.daily_budget || 0),
        lifetime_budget: parseFloat(metadata.lifetime_budget || 0),
        budget_remaining: parseFloat(metadata.budget_remaining || 0)
      },
      ad_set_level: adSetBudgets,
      total_daily_budget: parseFloat(metadata.daily_budget || 0) + adSetBudgets.daily,
      total_lifetime_budget: parseFloat(metadata.lifetime_budget || 0) + adSetBudgets.lifetime,
      total_remaining: parseFloat(metadata.budget_remaining || 0) + adSetBudgets.remaining,
      source: 'metadata and ad_sets'
    },
    campaign_age: {
      start_time: metadata.start_time,
      age_months: metadata.start_time ? Math.floor((new Date() - new Date(metadata.start_time)) / (1000 * 60 * 60 * 24 * 30)) : 0,
      source: 'metadata'
    },
    performance: insights.data?.[0] ? {
      spend: parseFloat(insights.data[0].spend || 0),
      impressions: parseInt(insights.data[0].impressions || 0),
      clicks: parseInt(insights.data[0].clicks || 0),
      ctr: parseFloat(insights.data[0].ctr || 0),
      cpc: parseFloat(insights.data[0].cpc || 0),
      source: 'insights'
    } : null,
    objective: {
      value: metadata.objective,
      source: 'metadata'
    },
    ad_sets: {
      count: adSets.data?.length || 0,
      optimization_goals: [...new Set(adSets.data?.map(adSet => adSet.optimization_goal) || [])],
      placements: adSets.data?.map(adSet => adSet.targeting?.geo_locations) || [],
      targeting: adSets.data?.map(adSet => ({
        age_min: adSet.targeting?.age_min,
        age_max: adSet.targeting?.age_max,
        genders: adSet.targeting?.genders,
        geo_locations: adSet.targeting?.geo_locations
      })) || [],
      source: 'ad_sets'
    }
  };

  console.log('\n📊 Extracted metrics:', JSON.stringify(extractedMetrics, null, 2));

  // Analyze metrics
  const metrics = [];

  // Check budget
  const hasBudget = extractedMetrics.budget.total_daily_budget > 0 || extractedMetrics.budget.total_lifetime_budget > 0;
  if (!hasBudget) {
    metrics.push({
      name: 'budget_sufficiency',
      status: 'warning',
      reason: 'No budget set for campaign or ad sets'
    });
  } else {
    metrics.push({
      name: 'budget_sufficiency',
      status: 'good',
      reason: `Total budget available: Daily=${extractedMetrics.budget.total_daily_budget}, Lifetime=${extractedMetrics.budget.total_lifetime_budget}`
    });
  }

  // Check campaign age
  if (extractedMetrics.campaign_age.age_months < 1) {
    metrics.push({
      name: 'campaign_age',
      status: 'info',
      reason: 'Campaign is new (less than 1 month old)'
    });
  } else {
    metrics.push({
      name: 'campaign_age',
      status: 'good',
      reason: `Campaign has been running for ${extractedMetrics.campaign_age.age_months} months`
    });
  }

  // Check performance
  if (extractedMetrics.performance) {
    const performance = extractedMetrics.performance;
    const hasGoodPerformance = performance.impressions > 1000 && performance.clicks > 0;
    metrics.push({
      name: 'performance',
      status: hasGoodPerformance ? 'good' : 'warning',
      reason: `Campaign has ${performance.impressions} impressions and ${performance.clicks} clicks (CTR: ${(performance.ctr * 100).toFixed(2)}%, CPC: $${performance.cpc.toFixed(2)})`
    });
  }

  // Check ad sets
  if (extractedMetrics.ad_sets.count > 0) {
    metrics.push({
      name: 'ad_sets',
      status: 'good',
      reason: `Campaign has ${extractedMetrics.ad_sets.count} ad sets with goals: ${extractedMetrics.ad_sets.optimization_goals.join(', ')}`
    });
  } else {
    metrics.push({
      name: 'ad_sets',
      status: 'warning',
      reason: 'No active ad sets found'
    });
  }

  // Format final output
  return {
    level: 'campaign',
    retrievedAt: new Date().toISOString(),
    insights: [{
      campaignId,
      metrics,
      extracted_metrics: extractedMetrics
    }],
    calculatedMetrics: {
      total_campaigns: 1,
      campaigns_with_issues: metrics.filter(m => m.status === 'warning').length,
      total_issues: metrics.filter(m => m.status === 'warning').length
    },
    analysisResults: [{
      campaign_id: campaignId,
      campaign_name: metadata.name,
      metrics,
      extracted_metrics: extractedMetrics
    }]
  };
}

/**
 * Calculate metrics from insight data
 * @param {Object} insight - The insight data
 * @param {Object} campaignMetadata - Campaign metadata
 * @returns {Object} - Calculated metrics
 */
function calculateMetrics(insight, campaignMetadata) {
    const metrics = {};
    
  // Basic metrics calculation
  metrics.spend = parseFloat(insight.spend || 0);
  metrics.impressions = parseInt(insight.impressions || 0);
  metrics.clicks = parseInt(insight.clicks || 0);
  metrics.reach = parseInt(insight.reach || 0);
  
  // Performance calculations
  metrics.cpc = metrics.clicks > 0 ? (metrics.spend / metrics.clicks) : 0;
  metrics.cpm = metrics.impressions > 0 ? (metrics.spend / metrics.impressions) * 1000 : 0;
  metrics.ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
  metrics.frequency = parseFloat(insight.frequency || 0);
  
  // Add budget information
  metrics.daily_budget = parseFloat(campaignMetadata.daily_budget || 0);
  metrics.lifetime_budget = parseFloat(campaignMetadata.lifetime_budget || 0);
  metrics.budget_remaining = parseFloat(campaignMetadata.budget_remaining || 0);
  
  // Add audience and creative counts
  metrics.audience_count = insight.audience_count || 0;
  metrics.creative_count = insight.creative_count || 0;
  
  // Add optimization goals
  metrics.optimization_goals = insight.optimization_goals || [];
  
  // Add placements info
  metrics.has_automatic_placements = insight.has_automatic_placements || false;
  
  // Calculate conversion metrics if available
  if (insight.actions) {
    const purchaseActions = insight.actions.filter(action => action.action_type === 'purchase');
    if (purchaseActions.length > 0) {
      metrics.purchases = parseInt(purchaseActions[0].value || 0);
      metrics.cost_per_purchase = metrics.purchases > 0 ? metrics.spend / metrics.purchases : 0;
    }
  }
  
  return metrics;
}

/**
 * Get campaign age in months
 * @param {Object} campaignMetadata - Campaign metadata
 * @returns {number} - Campaign age in months
 */
function getCampaignAge(campaignMetadata) {
  if (!campaignMetadata.start_time) return 0;
  
  const campaignAge = (new Date() - new Date(campaignMetadata.start_time)) / (1000 * 60 * 60 * 24 * 30); // months
  return Math.round(campaignAge * 10) / 10;
}

/**
 * Get campaign age analysis
 * @param {Object} campaignMetadata - Campaign metadata
 * @returns {string} - Analysis text
 */
function getCampaignAgeAnalysis(campaignMetadata) {
  if (!campaignMetadata.start_time) return 'Campaign age information not available';
  
  const campaignAge = getCampaignAge(campaignMetadata);
  let analysis = campaignAge > 18 ? 
    'Campaign is older than 18 months' : 
    'Campaign age is acceptable';
    
  if (campaignMetadata.status === 'ACTIVE') {
    analysis += ' and is currently active';
  } else if (campaignMetadata.status) {
    analysis += ` and has status ${campaignMetadata.status}`;
  }
  
  return analysis;
}

/**
 * Get campaign age recommendation
 * @param {Object} campaignMetadata - Campaign metadata
 * @returns {string} - Recommendation text
 */
function getCampaignAgeRecommendation(campaignMetadata) {
  if (!campaignMetadata.start_time) return 'Ensure campaign start date is properly set';
  
  const campaignAge = getCampaignAge(campaignMetadata);
  return campaignAge > 18 ? 
    'Consider refreshing the campaign to maintain performance' : 
    'Continue monitoring campaign performance';
}

/**
 * Get budget analysis
 * @param {Object} metrics - Calculated metrics
 * @returns {string} - Analysis text
 */
function getBudgetAnalysis(metrics) {
  if (metrics.daily_budget <= 0 && metrics.lifetime_budget <= 0) {
    return 'Budget information not available';
  }
  
  const hasSufficientBudget = metrics.cost_per_purchase ? 
    (metrics.daily_budget >= metrics.cost_per_purchase || metrics.lifetime_budget >= metrics.cost_per_purchase) : 
    true;
    
  return hasSufficientBudget ? 
    'Budget is sufficient for generating conversions' : 
    'Budget may be too low to generate conversions';
}

/**
 * Get budget recommendation
 * @param {Object} metrics - Calculated metrics
 * @returns {string} - Recommendation text
 */
function getBudgetRecommendation(metrics) {
  if (metrics.daily_budget <= 0 && metrics.lifetime_budget <= 0) {
    return 'Set an appropriate budget based on your conversion goals';
  }
  
  const hasSufficientBudget = metrics.cost_per_purchase ? 
    (metrics.daily_budget >= metrics.cost_per_purchase || metrics.lifetime_budget >= metrics.cost_per_purchase) : 
    true;
    
  return hasSufficientBudget ? 
    'Continue with current budget strategy' : 
    'Consider increasing budget to at least match the cost per conversion';
}

/**
 * Get optimization analysis
 * @param {Array} optimizationGoals - Optimization goals
 * @returns {string} - Analysis text
 */
function getOptimizationAnalysis(optimizationGoals) {
  if (!optimizationGoals || optimizationGoals.length === 0) {
    return 'Optimization goal information not available';
  }
  
  const hasOptimalGoal = optimizationGoals.some(goal => 
    ['OFFSITE_CONVERSIONS', 'VALUE', 'PURCHASE'].includes(goal?.toUpperCase())
  );
  
  return hasOptimalGoal ? 
    'Optimization goal is aligned with final objective' : 
    'Optimization goal may not be aligned with final objective';
}

/**
 * Get optimization recommendation
 * @param {Array} optimizationGoals - Optimization goals
 * @returns {string} - Recommendation text
 */
function getOptimizationRecommendation(optimizationGoals) {
  if (!optimizationGoals || optimizationGoals.length === 0) {
    return 'Set an optimization goal aligned with your final objective';
  }
  
  const hasOptimalGoal = optimizationGoals.some(goal => 
    ['OFFSITE_CONVERSIONS', 'VALUE', 'PURCHASE'].includes(goal?.toUpperCase())
  );
  
  return hasOptimalGoal ? 
    'Continue with current optimization strategy' : 
    'Consider optimizing for final objective (e.g., Purchase for e-commerce)';
}

/**
 * Get creative analysis
 * @param {Object} campaignGroup - Campaign group data
 * @param {string} adSetId - Ad set ID
 * @returns {string} - Analysis text
 */
function getCreativeAnalysis(campaignGroup, adSetId) {
  const adSetData = campaignGroup.adSets[adSetId];
  const creativeCount = Object.keys(adSetData.ads).length;
  
  return creativeCount <= 4 ? 
    `Using ${creativeCount} creatives (optimal)` : 
    `Using ${creativeCount} creatives (too many)`;
}

/**
 * Get creative recommendation
 * @param {Object} campaignGroup - Campaign group data
 * @param {string} adSetId - Ad set ID
 * @returns {string} - Recommendation text
 */
function getCreativeRecommendation(campaignGroup, adSetId) {
  const adSetData = campaignGroup.adSets[adSetId];
  const creativeCount = Object.keys(adSetData.ads).length;
  
  return creativeCount <= 4 ? 
    'Continue with current creative strategy' : 
    'Consider reducing the number of creatives to fewer than 4';
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
    
    // Step 1: Fetch all active campaigns
    const activeCampaigns = await fetchActiveCampaigns(options.accountId);
    console.log(`📊 Found ${activeCampaigns.length} active campaigns`);
    
    if (activeCampaigns.length === 0) {
      console.log(`⚠️ No active campaigns found for account ${options.accountId}`);
      return {
        success: true,
        message: 'No active campaigns found',
        executionId: options.executionId,
        metrics: {},
        dataPoints: 0
      };
    }
    
    // Step 2: Fetch insights for each active campaign
    const allInsights = await fetchCampaignInsights(activeCampaigns, options);
    console.log(`📊 Retrieved insights for ${allInsights.length} data points`);

    // Step 3: Format and store the data
    const formattedData = formatInsightsData({ insights: { data: allInsights } }, null, {
      accountId: options.accountId,
      timeframe: options.timeframe,
      level: options.level || 'campaign',
      executionId: options.executionId
    });
    
    formattedData.executionId = options.executionId;
    
    return {
      success: true,
      message: 'Facebook insights retrieved and stored successfully',
      executionId: options.executionId,
      metrics: formattedData.calculatedMetrics,
      dataPoints: allInsights.length
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

/**
 * Get detailed analysis for a specific campaign
 * @param {string} accountId - Facebook Ad Account ID
 * @param {string} campaignId - Campaign ID to analyze
 * @param {string} timeframe - Date preset (last_7d, last_30d, etc.)
 * @returns {Promise<Object>} - Detailed campaign analysis
 */
async function getCampaignAnalysis(accountId, campaignId, timeframe = 'last_30d') {
  try {
    console.log(`🔍 Getting detailed analysis for campaign ${campaignId}`);
    
    const accessToken = validateEnvironment();

    // Get campaign data
    const campaignResponse = await axios.get(`https://graph.facebook.com/v19.0/${campaignId}`, {
      params: {
        fields: 'id,name,start_time,status,budget_remaining,daily_budget,lifetime_budget,objective',
        access_token: accessToken
      }
    });
    
    // Get ad sets with detailed placement and targeting info
    const adSetsResponse = await axios.get(`https://graph.facebook.com/v19.0/${campaignId}/adsets`, {
      params: {
        fields: 'id,name,optimization_goal,targeting,status,daily_budget,lifetime_budget,budget_remaining,bid_strategy,billing_event,promoted_object,publisher_platforms,platform_delivery_and_forecast,targeting_automation,advantage_audience',
        access_token: accessToken
      }
    });
    
    // Get ads with creative info
    const adsResponse = await axios.get(`https://graph.facebook.com/v19.0/${campaignId}/ads`, {
      params: {
        fields: 'id,name,creative,status,adset_id,tracking_specs',
        access_token: accessToken
      }
    });
    
    // Get insights with attribution data
    const insightsResponse = await axios.get(`https://graph.facebook.com/v19.0/${campaignId}/insights`, {
      params: {
        fields: 'spend,impressions,clicks,reach,frequency,ctr,cpc,cpp,cpm,actions,action_values,cost_per_action_type',
        date_preset: timeframe,
        action_attribution_windows: ['1d_click', '1d_view', '7d_click'],
        access_token: accessToken
      }
    });

    // Create a campaign object with metrics and analysis
    const campaign = {
      campaign_id: campaignId,
      campaign_name: campaignResponse.data.name || 'Unknown Campaign',
      overall_status: campaignResponse.data.status,
      metrics: [],
      ad_sets: [],
      execution_id: `test_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    // Add metrics in the correct order
    // 1. Attribution Window
    const attributionWindows = ['1d_click', '1d_view', '7d_click'];
    const has7dClick = attributionWindows.includes('7d_click');
    campaign.metrics.push({
      name: 'Attribution Window',
      status: has7dClick ? 'OK' : 'NOT OK',
      value: attributionWindows,
      reason: has7dClick ? 
        'Using recommended 7-day click attribution' : 
        'Not using recommended 7-day click attribution',
      recommendation: has7dClick ?
        'Continue using 7-day click attribution' :
        'Set attribution window to 7-day click in Events Manager > Settings > Attribution'
    });

    // 2. Budget Distribution
    const campaignName = campaignResponse.data.name.toLowerCase();
    const isTOF = campaignName.includes('tof');
    const isMOF = campaignName.includes('mof');
    const isBOF = campaignName.includes('bof');

    const hasFunnelIdentifier = isTOF || isMOF || isBOF;
    const totalBudget = parseFloat(campaignResponse.data.daily_budget || 0) +
      adSetsResponse.data.data.reduce((sum, adSet) => sum + parseFloat(adSet.daily_budget || 0), 0);

    // Get all active campaigns to calculate total budget distribution
    const allCampaigns = await fetchActiveCampaigns(accountId);
    const allCampaignsData = await Promise.all(allCampaigns.map(async (camp) => {
      const response = await axios.get(`https://graph.facebook.com/v19.0/${camp.id}`, {
        params: {
          fields: 'id,name,daily_budget',
          access_token: accessToken
        }
      });
      const adSetsResp = await axios.get(`https://graph.facebook.com/v19.0/${camp.id}/adsets`, {
        params: {
          fields: 'daily_budget',
          access_token: accessToken
        }
      });
      return {
        name: response.data.name.toLowerCase(),
        budget: parseFloat(response.data.daily_budget || 0) +
          adSetsResp.data.data.reduce((sum, adSet) => sum + parseFloat(adSet.daily_budget || 0), 0)
      };
    }));

    const totalAllCampaignsBudget = allCampaignsData.reduce((sum, camp) => sum + camp.budget, 0);
    const tofBudget = allCampaignsData
      .filter(camp => camp.name.includes('tof'))
      .reduce((sum, camp) => sum + camp.budget, 0);
    const mofBofBudget = allCampaignsData
      .filter(camp => camp.name.includes('mof') || camp.name.includes('bof'))
      .reduce((sum, camp) => sum + camp.budget, 0);

    const tofPercentage = totalAllCampaignsBudget > 0 ? (tofBudget / totalAllCampaignsBudget * 100) : 0;
    const mofBofPercentage = totalAllCampaignsBudget > 0 ? (mofBofBudget / totalAllCampaignsBudget * 100) : 0;

    campaign.metrics.push({
      name: 'Budget Distribution',
      status: hasFunnelIdentifier && tofPercentage >= 70 && mofBofPercentage <= 30 ? 'OK' : 'NOT OK',
      value: {
        has_funnel_identifier: hasFunnelIdentifier,
        tof_percentage: `${tofPercentage.toFixed(1)}%`,
        mof_bof_percentage: `${mofBofPercentage.toFixed(1)}%`,
        total_budget: totalAllCampaignsBudget
      },
      reason: !hasFunnelIdentifier ? 
        'Campaign name missing funnel identifier (TOF/MOF/BOF)' :
        tofPercentage < 70 ? 
          `TOF budget (${tofPercentage.toFixed(1)}%) is below target of 70%` :
          mofBofPercentage > 30 ?
            `MOF+BOF budget (${mofBofPercentage.toFixed(1)}%) exceeds limit of 30%` :
            `Good budget distribution: TOF ${tofPercentage.toFixed(1)}%, MOF+BOF ${mofBofPercentage.toFixed(1)}%`,
      recommendation: !hasFunnelIdentifier ?
        'Add TOF, MOF, or BOF to campaign name to identify funnel stage' :
        tofPercentage < 70 ?
          'Increase budget allocation for TOF campaigns to reach 70% minimum' :
          mofBofPercentage > 30 ?
            'Reduce MOF+BOF budget to stay within 30% limit' :
            'Continue maintaining current budget distribution'
    });

    // 3. View/Click Ratio (Impressions/Clicks)
    const insight = insightsResponse.data.data?.[0];
    const campaignAgeMs = campaignResponse.data.start_time ? 
      (new Date() - new Date(campaignResponse.data.start_time)) : 0;
    const campaignAgeDays = Math.floor(campaignAgeMs / (1000 * 60 * 60 * 24));

    if (campaignAgeDays < 1) {
      campaign.metrics.push({
        name: 'View Click Ratio',
        status: 'OK',
        value: {
          impressions: insight?.impressions || 0,
          clicks: insight?.clicks || 0,
          ratio: 'N/A',
          campaign_age_days: campaignAgeDays
        },
        reason: 'Campaign too recent (less than 1 day old)',
        recommendation: 'Wait for at least 1 day of data before evaluating impressions/clicks ratio'
      });
    } else if (insight) {
      const impressions = parseInt(insight.impressions || 0);
      const clicks = parseInt(insight.clicks || 0);
      const ratio = clicks > 0 ? (impressions / clicks) : 0;
      
      campaign.metrics.push({
        name: 'View Click Ratio',
        status: ratio >= 40 ? 'OK' : 'NOT OK',
        value: {
          impressions: impressions,
          clicks: clicks,
          ratio: ratio.toFixed(1),
          campaign_age_days: campaignAgeDays
        },
        reason: ratio >= 40 ?
          `Good impressions/clicks ratio of ${ratio.toFixed(1)}` :
          `Low impressions/clicks ratio of ${ratio.toFixed(1)} (target: ≥40)`,
        recommendation: ratio >= 40 ?
          'Continue monitoring impression to click ratio' :
          'Consider improving ad creative or targeting to increase impression to click ratio'
      });
    } else {
      campaign.metrics.push({
        name: 'View Click Ratio',
        status: 'NOT OK',
        value: {
          impressions: 0,
          clicks: 0,
          ratio: '0.0',
          campaign_age_days: campaignAgeDays
        },
        reason: 'No impression or click data available',
        recommendation: 'Ensure campaign is running and collecting data'
      });
    }

    // 4. Budget
    const totalDailyBudget = parseFloat(campaignResponse.data.daily_budget || 0) +
      adSetsResponse.data.data.reduce((sum, adSet) => sum + parseFloat(adSet.daily_budget || 0), 0);
    const totalLifetimeBudget = parseFloat(campaignResponse.data.lifetime_budget || 0) +
      adSetsResponse.data.data.reduce((sum, adSet) => sum + parseFloat(adSet.lifetime_budget || 0), 0);
    
    campaign.metrics.push({
      name: 'Budget',
      status: totalDailyBudget > 0 || totalLifetimeBudget > 0 ? 'OK' : 'NOT OK',
      value: {
        daily_budget: totalDailyBudget,
        lifetime_budget: totalLifetimeBudget,
        remaining: parseFloat(campaignResponse.data.budget_remaining || 0)
      },
      reason: totalDailyBudget > 0 || totalLifetimeBudget > 0 ?
        `Total budget: Daily=$${totalDailyBudget}, Lifetime=$${totalLifetimeBudget}` :
        'No budget set at campaign or ad set level',
      recommendation: totalDailyBudget > 0 || totalLifetimeBudget > 0 ?
        'Monitor spend against budget limits' :
        'Set appropriate budget limits for campaign or ad sets'
    });

    // 5. Campaign Age
    const ageMonths = campaignResponse.data.start_time ? 
      Math.round((new Date() - new Date(campaignResponse.data.start_time)) / (1000 * 60 * 60 * 24 * 30) * 10) / 10 : 0;
    
    campaign.metrics.push({
      name: 'Campaign Age',
      status: campaignResponse.data.status === 'ACTIVE' ? 'OK' : 'NOT OK',
      value: {
        age_months: ageMonths,
        start_time: campaignResponse.data.start_time,
        is_active: campaignResponse.data.status === 'ACTIVE'
      },
      reason: `Campaign is ${ageMonths} months old and ${campaignResponse.data.status === 'ACTIVE' ? 'active' : 'inactive'}`,
      recommendation: campaignResponse.data.status === 'ACTIVE' ?
        'Continue monitoring campaign performance' :
        'Consider reactivating campaign or creating a new one'
    });

    // Add ad sets with metrics
    campaign.ad_sets = adSetsResponse.data.data.map(adSet => {
      const adSetObj = {
        adset_id: adSet.id,
        adset_name: adSet.name || 'Unknown Ad Set',
        status: adSet.status,
        metrics: []
      };

      // Add Optimization Goal metric
      adSetObj.metrics.push({
        name: 'Optimization Goal',
        status: adSet.optimization_goal === 'PURCHASE' ? 'OK' : 'NOT OK',
        value: adSet.optimization_goal,
        reason: adSet.optimization_goal === 'PURCHASE' ?
          'Using recommended PURCHASE optimization goal' :
          `Currently optimizing for ${adSet.optimization_goal}, not PURCHASE`,
        recommendation: adSet.optimization_goal === 'PURCHASE' ?
          'Continue optimizing for purchases' :
          'Consider changing optimization goal to PURCHASE for e-commerce campaigns'
      });

      // Add Placements metric
      adSetObj.metrics.push({
        name: 'Placements',
        status: 'OK',
        value: 'Advantage+',
        reason: '',
        recommendation: 'Consider using Advantage+ placements for potentially 30% higher ROAS'
      });

      // Add ads for this ad set
      const adsForAdSet = adsResponse.data.data.filter(ad => ad.adset_id === adSet.id);
      adSetObj.ads = adsForAdSet.map(ad => ({
        ad_id: ad.id,
        ad_name: ad.name || 'Unknown Ad',
        status: ad.status,
        metrics: [{
          name: 'Creative',
          status: ad.creative?.id ? 'OK' : 'NOT OK',
          value: {
            creative_id: ad.creative?.id || 'unknown'
          },
          reason: ad.creative?.id ?
            'Creative is properly configured' :
            'No creative found for this ad',
          recommendation: ad.creative?.id ?
            'Monitor creative performance' :
            'Add creative to the ad'
        }]
      }));

      return adSetObj;
    });

    // Store the analysis in MongoDB
    try {
      await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
        operation: 'save_facebook_insights',
        flowData: {
          execution_id: campaign.execution_id,
          timestamp: campaign.timestamp,
          account_id: accountId,
          timeframe: timeframe,
          level: 'campaign',
          campaigns: [campaign],
          summary: {
            total_campaigns: 1,
            campaigns_with_issues: campaign.metrics.filter(m => m.status === 'NOT OK').length,
            total_issues: campaign.metrics.filter(m => m.status === 'NOT OK').length
          }
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Analysis data stored in MongoDB');
    } catch (error) {
      console.error('❌ Error storing analysis in MongoDB:', error.message);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
    }

    return {
      success: true,
      analysis: campaign,
      source: 'fresh',
      execution_id: campaign.execution_id,
      timestamp: campaign.timestamp
    };
    
  } catch (error) {
    console.error(`❌ Error getting campaign analysis: ${error.message}`);
    if (error.response) {
      console.error('Error details:', error.response.data?.error || error.response.data);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test function to directly check metric extraction
 */
async function testMetricExtraction(accountId = '1030162515542628') {
  try {
    console.log('\n🧪 Starting metric extraction test...\n');
    
    // Fetch active campaigns
    console.log(`📊 Fetching active campaigns for account ${accountId}`);
    const campaigns = await fetchActiveCampaigns(accountId);
    if (!campaigns || campaigns.length === 0) {
      console.log('❌ No active campaigns found');
      return;
    }
    console.log(`✅ Successfully retrieved ${campaigns.length} active campaigns`);

    // Test with first campaign
    const campaign = campaigns[0];
    console.log(`\n🔍 Testing with campaign: ${campaign.name} (${campaign.id})\n`);

    // Get campaign metadata
    const metadata = await axios.get(
      `https://graph.facebook.com/v19.0/${campaign.id}`,
      {
        params: {
          access_token: await validateEnvironment(),
          fields: 'id,name,start_time,status,budget_remaining,daily_budget,lifetime_budget,objective,special_ad_categories'
        }
      }
    );
    console.log('📊 Campaign metadata:', JSON.stringify(metadata.data, null, 2));

    // Get campaign insights with attribution windows
    const insights = await axios.get(
      `https://graph.facebook.com/v19.0/${campaign.id}/insights`,
      {
        params: {
          access_token: await validateEnvironment(),
          fields: 'spend,impressions,clicks,ctr,cpc,objective,optimization_goal,actions,action_values,cost_per_action_type',
          action_attribution_windows: ['1d_click', '1d_view', '7d_click'],
          date_preset: 'last_30d'
        }
      }
    );
    console.log('\n📊 Campaign insights:', JSON.stringify(insights.data, null, 2));

    // Get ad sets
    const adSets = await axios.get(
      `https://graph.facebook.com/v19.0/${campaign.id}/adsets`,
      {
        params: {
          access_token: await validateEnvironment(),
          fields: 'id,name,optimization_goal,bid_strategy,billing_event,budget_remaining,daily_budget,lifetime_budget,targeting,status'
        }
      }
    );
    console.log('\n📊 Campaign ad sets:', JSON.stringify(adSets.data, null, 2));

    // Format insights data
    console.log('🔄 Formatting insights data for storage');
    const formattedData = await formatInsightsData(campaign.id, insights.data, metadata.data, adSets.data);
    console.log('\n📊 Formatted data:', JSON.stringify(formattedData, null, 2));

  } catch (error) {
    console.error('❌ Error during test:', error);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
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
      filter: query
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

module.exports = {
  fetchActiveCampaigns,
  fetchCampaignInsights,
  fetchAndStoreInsights,
  getAudienceData,
  formatInsightsData,
  getCampaignAnalysis,
  testMetricExtraction
};