/**
 * PACTO Analysis for Facebook Campaigns
 * 
 * This module provides comprehensive analysis of Facebook campaigns
 * based on best practices and predefined rules.
 */

const facebookAPI = require('./facebook_marketing.api');
const sheetsExport = require('./google_sheets_export');

/**
 * Generate a comprehensive analysis report for Facebook campaigns
 * @param {Object} options - Analysis options
 * @param {string} options.accountId - Facebook Ad Account ID
 * @param {string} options.timeframe - Date preset (last_7d, last_30d, etc.)
 * @param {string} [options.campaignId] - Optional specific campaign ID to analyze
 * @returns {Promise<Object>} - Analysis report
 */
async function generateAnalysisReport(options) {
  try {
    console.log(`🔍 Generating PACTO analysis report for account ${options.accountId}`);
    
    // Validate required parameters
    if (!options.accountId) {
      throw new Error('accountId is required for analysis');
    }
    
    if (!options.timeframe) {
      options.timeframe = 'last_30d'; // Default to last 30 days
      console.log(`⚠️ No timeframe specified, defaulting to ${options.timeframe}`);
    }
    
    // Step 1: Get campaign data (either from stored data or fetch fresh)
    let campaignData;
    let storedData = await facebookAPI.getStoredInsightsData({
      accountId: options.accountId,
      timeframe: options.timeframe
    });
    
    // If we have stored data, use it; otherwise fetch fresh data
    if (storedData && storedData.length > 0 && 
        ((storedData[0].insights && storedData[0].insights.length > 0) || 
         (storedData[0].analysisResults && Array.isArray(storedData[0].analysisResults) && storedData[0].analysisResults.length > 0))) {
      console.log(`✅ Using stored data for analysis`);
      campaignData = storedData[0];
    } else {
      console.log(`⚠️ No stored data found or data is incomplete, fetching fresh data`);
      const fetchResult = await facebookAPI.fetchAndStoreInsights({
        accountId: options.accountId,
        timeframe: options.timeframe,
        executionId: `pacto-analysis-${Date.now()}`
      });
      
      if (!fetchResult.success) {
        throw new Error(fetchResult.error || 'Failed to fetch campaign data');
      }
      
      // Get the newly stored data
      storedData = await facebookAPI.getStoredInsightsData({
        accountId: options.accountId,
        timeframe: options.timeframe
      });
      
      if (!storedData || storedData.length === 0) {
        throw new Error('Failed to retrieve stored data after fetching');
      }
      
      campaignData = storedData[0];
    }
    
    // Log the structure of the data to help debug
    console.log(`📊 Campaign data structure:`, {
      hasInsights: !!campaignData.insights,
      insightsLength: campaignData.insights ? campaignData.insights.length : 0,
      hasAnalysisResults: !!campaignData.analysisResults,
      analysisResultsType: campaignData.analysisResults ? typeof campaignData.analysisResults : 'undefined',
      isAnalysisResultsArray: Array.isArray(campaignData.analysisResults),
      analysisResultsLength: Array.isArray(campaignData.analysisResults) ? campaignData.analysisResults.length : 0
    });
    
    // Step 2: Generate the analysis report
    const report = await analyzeData(campaignData, options);
    
    return report;
  } catch (error) {
    console.error(`❌ Error generating analysis report: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze campaign data and generate a structured report
 * @param {Object} campaignData - Campaign data from Facebook API
 * @param {Object} options - Analysis options
 * @returns {Object} - Structured analysis report
 */
async function analyzeData(campaignData, options) {
  console.log(`🧠 Analyzing campaign data`);
  
  // Initialize the report structure
  const report = {
    timestamp: new Date().toISOString(),
    account_id: options.accountId,
    summary: {
      total_campaigns: 0,
      campaigns_with_issues: 0,
      total_issues: 0
    },
    campaigns: []
  };
  
  // Ensure we have valid analysis results
  if (!campaignData.analysisResults || !Array.isArray(campaignData.analysisResults)) {
    console.log(`⚠️ No valid analysis results found in data, attempting to generate from insights`);
    
    // If we have insights but no analysis results, we can try to generate analysis from insights
    if (campaignData.insights && Array.isArray(campaignData.insights) && campaignData.insights.length > 0) {
      // Create simple analysis results from insights
      campaignData.analysisResults = campaignData.insights.map(insight => {
        const campaignMetadata = insight.campaign_metadata || {};
        return {
          campaign_id: campaignMetadata.id || 'unknown',
          campaign_name: campaignMetadata.name || 'Unknown Campaign',
          metrics: {
            spend: parseFloat(insight.spend || 0),
            impressions: parseInt(insight.impressions || 0),
            clicks: parseInt(insight.clicks || 0),
            ctr: parseFloat(insight.ctr || 0),
            cpc: parseFloat(insight.cpc || 0),
            cpm: parseFloat(insight.cpm || 0)
          },
          attribution_window: {
            value: insight.attribution_setting || 'unknown',
            analysis: insight.attribution_setting === '7d_click_1d_view' ? 
              'Optimal attribution window' : 
              'Sub-optimal attribution window',
            recommendation: 'Attribution window should be 7-day click for e-commerce'
          },
          budget: {
            daily_budget: parseFloat(campaignMetadata.daily_budget || 0),
            lifetime_budget: parseFloat(campaignMetadata.lifetime_budget || 0),
            budget_remaining: parseFloat(campaignMetadata.budget_remaining || 0),
            analysis: 'Budget information available'
          },
          campaign_age: {
            start_time: campaignMetadata.start_time,
            is_ongoing: campaignMetadata.status === 'ACTIVE',
            age_months: calculateCampaignAge(campaignMetadata.start_time),
            analysis: 'Campaign age information available'
          },
          placements: {
            is_automatic: insight.has_automatic_placements || false,
            analysis: insight.has_automatic_placements ? 
              'Using automatic placements' : 
              'Using manual placements'
          },
          optimization: {
            goals: insight.optimization_goals || [],
            analysis: 'Optimization goal information available'
          },
          ad_sets: (insight.ad_sets || []).map(adSet => ({
            adset_id: adSet.id,
            adset_name: adSet.name || 'Unknown Ad Set',
            optimization_goal: adSet.optimization_goal || 'unknown',
            status: adSet.status || 'unknown',
            audience: {
              count: insight.audience_count || 0,
              analysis: (insight.audience_count || 0) <= 4 ? 
                'Optimal number of audiences' : 
                'Too many audiences'
            },
            ads: (insight.ads || []).filter(ad => ad.adset_id === adSet.id).map(ad => ({
              ad_id: ad.id,
              ad_name: ad.name || 'Unknown Ad',
              status: ad.status || 'unknown',
              creative: {
                id: ad.creative?.id || 'unknown',
                analysis: `Using ${insight.creative_count || 1} creatives`
              }
            }))
          }))
        };
      });
      
      console.log(`✅ Generated analysis results from insights: ${campaignData.analysisResults.length} campaigns`);
    } else {
      throw new Error('No valid analysis results or insights found in data');
    }
  }
  
  // Get analysis results and insights
  const analysisResults = campaignData.analysisResults || [];
  const insights = campaignData.insights || [];
  
  // If we have a specific campaign ID, filter for just that campaign
  if (options.campaignId) {
    const filteredResults = analysisResults.filter(result => result.campaign_id === options.campaignId);
    if (filteredResults.length === 0) {
      throw new Error(`Campaign with ID ${options.campaignId} not found in data`);
    }
    report.summary.total_campaigns = filteredResults.length;
    await processCampaigns(filteredResults, insights, report);
  } else {
    // Process all campaigns
    report.summary.total_campaigns = analysisResults.length;
    await processCampaigns(analysisResults, insights, report);
  }
  
  return {
    success: true,
    report
  };
}

/**
 * Calculate campaign age in months
 * @param {string} startTime - Campaign start time
 * @returns {number} - Campaign age in months
 */
function calculateCampaignAge(startTime) {
  if (!startTime) return 0;
  
  const campaignAge = (new Date() - new Date(startTime)) / (1000 * 60 * 60 * 24 * 30); // months
  return Math.round(campaignAge * 10) / 10;
}

/**
 * Process campaigns and add them to the report
 * @param {Array} analysisResults - Campaign analysis results
 * @param {Array} insights - Campaign insights data
 * @param {Object} report - The report object to update
 */
async function processCampaigns(analysisResults, insights, report) {
  for (const campaignAnalysis of analysisResults) {
    // Find corresponding insight data
    const campaignInsight = insights.find(insight => 
      insight.campaign_metadata && insight.campaign_metadata.id === campaignAnalysis.campaign_id
    );
    
    // Initialize campaign report object
    const campaignReport = {
      campaign_id: campaignAnalysis.campaign_id,
      campaign_name: campaignAnalysis.campaign_name,
      overall_status: "OK",
      metrics: [],
      ad_sets: []
    };
    
    // Track issues for this campaign
    let campaignHasIssues = false;
    let campaignIssueCount = 0;
    
    // Analyze campaign-level metrics
    
    // 1. Attribution Window
    const attributionMetric = {
      name: "Attribution Window",
      status: "OK",
      reason: "",
      recommendation: ""
    };
    
    if (campaignAnalysis.attribution_window && 
        campaignAnalysis.attribution_window.value !== "7d_click_1d_view" && 
        campaignAnalysis.attribution_window.value !== "7d_click") {
      attributionMetric.status = "NOT OK";
      attributionMetric.reason = `Wrong attribution window (${campaignAnalysis.attribution_window.value || 'unknown'} instead of 7d_click_1d_view)`;
      attributionMetric.recommendation = "Change to 7-day click attribution for e-commerce";
      campaignHasIssues = true;
      campaignIssueCount++;
    }
    
    campaignReport.metrics.push(attributionMetric);
    
    // 2. Budget
    const budgetMetric = {
      name: "Budget",
      status: "OK",
      reason: "",
      recommendation: ""
    };
    
    // Check if budget is too low (this is a simplified check)
    if (campaignAnalysis.budget && 
        ((campaignAnalysis.budget.daily_budget < 10 && campaignAnalysis.budget.lifetime_budget < 100) || 
         (campaignAnalysis.budget.analysis && campaignAnalysis.budget.analysis.includes("too low")))) {
      budgetMetric.status = "NOT OK";
      budgetMetric.reason = "Budget may be too low to generate conversions";
      budgetMetric.recommendation = "Increase budget to match your target cost per conversion";
      campaignHasIssues = true;
      campaignIssueCount++;
    }
    
    campaignReport.metrics.push(budgetMetric);
    
    // 3. Campaign Age
    const ageMetric = {
      name: "Campaign Age",
      status: "OK",
      reason: "",
      recommendation: ""
    };
    
    if (campaignAnalysis.campaign_age && campaignAnalysis.campaign_age.age_months > 18) {
      ageMetric.status = "NOT OK";
      ageMetric.reason = `Campaign is ${campaignAnalysis.campaign_age.age_months} months old (>18 months threshold)`;
      ageMetric.recommendation = "Close this campaign and launch a new one to maintain performance";
      campaignHasIssues = true;
      campaignIssueCount++;
    }
    
    campaignReport.metrics.push(ageMetric);
    
    // 4. Placements
    const placementsMetric = {
      name: "Placements",
      status: "OK",
      reason: "",
      recommendation: ""
    };
    
    if (campaignAnalysis.placements && !campaignAnalysis.placements.is_automatic) {
      placementsMetric.status = "NOT OK";
      placementsMetric.reason = "Using manual placements instead of automatic";
      placementsMetric.recommendation = "Switch to automatic placements to maximize distribution and reduce CPM";
      campaignHasIssues = true;
      campaignIssueCount++;
    }
    
    campaignReport.metrics.push(placementsMetric);
    
    // 5. Optimization Goal
    const optimizationMetric = {
      name: "Optimization Goal",
      status: "OK",
      reason: "",
      recommendation: ""
    };
    
    if (campaignAnalysis.optimization && campaignAnalysis.optimization.goals) {
      const hasOptimalGoal = campaignAnalysis.optimization.goals.some(goal => 
        ['OFFSITE_CONVERSIONS', 'VALUE', 'PURCHASE'].includes(goal?.toUpperCase())
      );
      
      if (!hasOptimalGoal) {
        optimizationMetric.status = "NOT OK";
        optimizationMetric.reason = `Optimization goal (${campaignAnalysis.optimization.goals.join(', ')}) not aligned with final objective`;
        optimizationMetric.recommendation = "Optimize for final objective (e.g., Purchase for e-commerce)";
        campaignHasIssues = true;
        campaignIssueCount++;
      }
    }
    
    campaignReport.metrics.push(optimizationMetric);
    
    // Process ad sets
    if (campaignAnalysis.ad_sets && Array.isArray(campaignAnalysis.ad_sets) && campaignAnalysis.ad_sets.length > 0) {
      for (const adSet of campaignAnalysis.ad_sets) {
        const adSetReport = {
          adset_id: adSet.adset_id,
          adset_name: adSet.adset_name,
          metrics: [],
          ads: []
        };
        
        // 6. Audience Count
        const audienceMetric = {
          name: "Audience Count",
          status: "OK",
          reason: "",
          recommendation: ""
        };
        
        if (adSet.audience && adSet.audience.count > 4) {
          audienceMetric.status = "NOT OK";
          audienceMetric.reason = `Too many audiences (${adSet.audience.count})`;
          audienceMetric.recommendation = "Reduce to fewer than 4 audiences";
          campaignHasIssues = true;
          campaignIssueCount++;
        }
        
        adSetReport.metrics.push(audienceMetric);
        
        // Process ads
        if (adSet.ads && Array.isArray(adSet.ads) && adSet.ads.length > 0) {
          for (const ad of adSet.ads) {
            const adReport = {
              ad_id: ad.ad_id,
              ad_name: ad.ad_name,
              metrics: []
            };
            
            // 7. Creative Count
            const creativeMetric = {
              name: "Creative Count",
              status: "OK",
              reason: "",
              recommendation: ""
            };
            
            // Extract creative count from analysis text if available
            let creativeCount = 0;
            if (ad.creative && ad.creative.analysis) {
              const creativeCountMatch = ad.creative.analysis.match(/Using (\d+) creatives/);
              creativeCount = creativeCountMatch ? parseInt(creativeCountMatch[1]) : 0;
            }
            
            if (creativeCount > 4) {
              creativeMetric.status = "NOT OK";
              creativeMetric.reason = `Too many creatives (${creativeCount})`;
              creativeMetric.recommendation = "Reduce to fewer than 4 creatives";
              campaignHasIssues = true;
              campaignIssueCount++;
            }
            
            adReport.metrics.push(creativeMetric);
            adSetReport.ads.push(adReport);
          }
        }
        
        campaignReport.ad_sets.push(adSetReport);
      }
    }
    
    // Update campaign overall status
    if (campaignHasIssues) {
      campaignReport.overall_status = "NEEDS ATTENTION";
      report.summary.campaigns_with_issues++;
      report.summary.total_issues += campaignIssueCount;
    }
    
    report.campaigns.push(campaignReport);
  }
}

/**
 * Get analysis for a specific campaign
 * @param {Object} options - Analysis options
 * @param {string} options.accountId - Facebook Ad Account ID
 * @param {string} options.campaignId - Campaign ID to analyze
 * @param {string} [options.timeframe] - Date preset (last_7d, last_30d, etc.)
 * @returns {Promise<Object>} - Campaign analysis
 */
async function getCampaignAnalysis(options) {
  try {
    if (!options.accountId || !options.campaignId) {
      throw new Error('accountId and campaignId are required');
    }
    
    if (!options.timeframe) {
      options.timeframe = 'last_30d';
    }
    
    const report = await generateAnalysisReport({
      accountId: options.accountId,
      timeframe: options.timeframe,
      campaignId: options.campaignId
    });
    
    return report;
  } catch (error) {
    console.error(`❌ Error getting campaign analysis: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Export PACTO analysis report to Google Sheets
 * @param {Object} analysisReport - The PACTO analysis report
 * @returns {Promise<string>} - URL of the created spreadsheet
 */
async function exportAnalysisToGoogleSheets(analysisReport) {
  try {
    console.log('🔄 Exporting PACTO analysis to Google Sheets...');
    
    // Call the Google Sheets export module
    const spreadsheetUrl = await sheetsExport.exportToGoogleSheets(analysisReport);
    
    return {
      success: true,
      spreadsheet_url: spreadsheetUrl
    };
  } catch (error) {
    console.error('❌ Error exporting analysis to Google Sheets:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate and export PACTO analysis report to Google Sheets
 * @param {string} accountId - Facebook Ad Account ID
 * @param {string} [timeframe='last_30d'] - Time range for data analysis
 * @param {string} [campaignId=null] - Optional campaign ID to analyze
 * @returns {Promise<Object>} - Result with spreadsheet URL
 */
async function generateAndExportAnalysisReport(accountId, timeframe = 'last_30d', campaignId = null) {
  try {
    console.log(`🔄 Generating and exporting PACTO analysis for account ${accountId}...`);
    
    // First generate the analysis report
    const analysisResult = await generateAnalysisReport({
      accountId: accountId,
      timeframe: timeframe,
      campaignId: campaignId
    });
    
    if (!analysisResult.success) {
      return {
        success: false,
        error: analysisResult.error
      };
    }
    
    // Then export to Google Sheets
    const exportResult = await exportAnalysisToGoogleSheets(analysisResult.report);
    
    if (!exportResult.success) {
      return {
        success: false,
        error: exportResult.error
      };
    }
    
    return {
      success: true,
      report: analysisResult.report,
      spreadsheet_url: exportResult.spreadsheet_url
    };
  } catch (error) {
    console.error('❌ Error generating and exporting analysis:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateAnalysisReport,
  getCampaignAnalysis,
  exportAnalysisToGoogleSheets,
  generateAndExportAnalysisReport
}; 