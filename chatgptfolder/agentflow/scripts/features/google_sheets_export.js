/**
 * Google Sheets Export Module
 * 
 * This module provides functionality to export PACTO analysis results to Google Sheets.
 * It uses a service account for authentication and creates a spreadsheet that's shared
 * with "anyone with the link" for easy access.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Path to service account credentials file
// In production, use environment variables instead of a file path
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                         path.join(__dirname, '../../config/google-service-account.json');

// Replace the metricGroups definition with this improved version
const metricGroups = [
  {
    name: "Current Metrics",
    color: { red: 0.85, green: 0.92, blue: 0.83 }, // D9EAD4
    metrics: [
      "Attribution Window",
      "Budget Distribution", 
      "View Click Ratio",
      "Budget",
      "Campaign Age",
      "Placements",
      "Optimization Goal"
    ]
  }
];

/**
 * Get authenticated Google API client using service account
 * @returns {Promise<Object>} - Authenticated Google API client
 */
async function getAuthClient() {
  try {
    // Check if credentials file exists
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(`Service account credentials file not found at ${CREDENTIALS_PATH}`);
    }
    
    // Load credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
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
 * Export PACTO analysis to Google Sheets
 * @param {Object} analysisReport - The PACTO analysis report
 * @returns {Promise<string>} - URL of the created spreadsheet
 */
async function exportToGoogleSheets(analysisReport) {
  try {
    console.log('🔄 Starting export to Google Sheets...');
    
    // Get authenticated client
    const auth = await getAuthClient();
    
    // Initialize Google Sheets and Drive APIs
    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    
    // 1. Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `PACTO Analysis - ${analysisReport.account_id} - ${new Date().toISOString().split('T')[0]}`
        },
        sheets: [
          { properties: { title: 'Summary' } },
          { properties: { title: 'Campaign Details' } },
          { properties: { title: 'Issues Only' } },
          { properties: { title: 'Raw Data' } }
        ]
      }
    });
    
    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log(`✅ Created spreadsheet: ${spreadsheetId}`);
    
    // 2. Populate Summary sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Summary!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['PACTO Analysis Summary'],
          [''],
          ['Account ID', analysisReport.account_id],
          ['Generated', analysisReport.timestamp],
          ['Timeframe', analysisReport.timeframe || 'Unknown'],
          [''],
          ['Total Campaigns', analysisReport.summary.total_campaigns],
          ['Campaigns with Issues', analysisReport.summary.campaigns_with_issues],
          ['Total Issues', analysisReport.summary.total_issues],
          [''],
          ['Metrics Documentation:'],
          [''],
          ['1. Attribution Window'],
          ['   - Required: 7-day click attribution for e-commerce'],
          ['   - Reason: Captures the full customer journey and purchase decision cycle'],
          ['   - Impact: Proper attribution ensures accurate ROAS measurement'],
          ['   - Current Setup: ' + (analysisReport.summary.attribution_window || 'Unknown')],
          ['   - How to Fix: Go to Events Manager > Settings > Attribution > Set to 7-day click'],
          [''],
          ['2. Budget Distribution'],
          ['   - Required: Minimum 70% of total budget on TOF campaigns'],
          ['   - Reason: Ensures sufficient focus on top-of-funnel customer acquisition'],
          ['   - Impact: MOF+BOF campaigns can be 0-30% combined'],
          ['   - How to Fix: Adjust campaign budgets to maintain TOF ≥70% and MOF+BOF ≤30%'],
          [''],
          ['3. View Click Ratio'],
          ['   - Required: Impressions/Clicks ratio ≥40 (after 1 day)'],
          ['   - Reason: Indicates efficient ad delivery and audience targeting'],
          ['   - Impact: Lower ratios may indicate targeting or creative issues'],
          ['   - How to Fix: Improve ad creative or adjust targeting for better impression efficiency'],
          [''],
          ['4. Budget'],
          ['   - Required: Daily budget > Average Cost per Conversion'],
          ['   - Reason: Ensures sufficient budget for consistent conversions'],
          ['   - Impact: Prevents budget limitations from affecting campaign performance'],
          [''],
          ['5. Campaign Age'],
          ['   - Required: < 18 months old'],
          ['   - Reason: Older campaigns may experience performance degradation'],
          ['   - Impact: Fresh campaigns maintain better performance'],
          [''],
          ['6. Placements'],
          ['   - Required: Advantage+ placements'],
          ['   - Reason: Meta\'s AI optimization across all placements'],
          ['   - Impact: Up to 30% higher ROAS compared to manual placements'],
          [''],
          ['7. Optimization Goal'],
          ['   - Required: PURCHASE for e-commerce'],
          ['   - Reason: Direct optimization for final conversion event'],
          ['   - Impact: Better alignment with business objectives'],
          [''],
          ['Current Status:'],
          [''],
          ['1. Attribution Window', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'Attribution Window')}`],
          ['2. Budget Distribution', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'Budget Distribution')}`],
          ['3. View Click Ratio', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'View Click Ratio')}`],
          ['4. Budget', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'Budget')}`],
          ['5. Campaign Age', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'Campaign Age')}`],
          ['6. Placements', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'Placements')}`],
          ['7. Optimization Goal', `${analysisReport.summary.campaigns_with_issues > 0 ? '⚠️' : '✅'} ${getMetricSummary(analysisReport, 'Optimization Goal')}`]
        ]
      }
    });
    
    // 3. Populate Campaign Details sheet
    // First, create headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Campaign Details!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['Campaign Name', 'Campaign ID', 'Overall Status', 'Level', 'Metric', 'Status', 'Current Value', 'Target Value', 'Reason', 'Recommendation']
        ]
      }
    });
    
    // Then, add campaign data
    const campaignDetailsRows = [];
    campaignDetailsRows.push(['Campaign Name', 'Campaign ID', 'Overall Status', 'Level', 'Metric', 'Status', 'Current Value', 'Target Value', 'Reason', 'Recommendation']);
    
    // Also prepare data for Issues Only sheet
    const issuesOnlyRows = [];
    issuesOnlyRows.push(['Campaign Name', 'Campaign ID', 'Level', 'Metric', 'Current Value', 'Target Value', 'Reason', 'Recommendation']);
    
    for (const campaign of analysisReport.campaigns) {
      // For each campaign, add all metrics except creative
      for (const metric of campaign.metrics) {
        // Skip creative metrics
        if (metric.name === 'Creative') continue;
        
        // Add attribution window if not present
        if (metric.name === 'Attribution Window') {
          const currentValue = getMetricValue(metric, campaign);
          const targetValue = getMetricTargetValue(metric.name);
          
          campaignDetailsRows.push([
            campaign.campaign_name,
            campaign.campaign_id,
            campaign.overall_status,
            'Campaign',
            metric.name,
            metric.status,
            currentValue,
            targetValue,
            metric.reason || '',
            metric.recommendation || ''
          ]);
          
          // Add to Issues Only if NOT OK
          if (metric.status === 'NOT OK') {
            issuesOnlyRows.push([
              campaign.campaign_name,
              campaign.campaign_id,
              'Campaign',
              metric.name,
              currentValue,
              targetValue,
              metric.reason || '',
              metric.recommendation || ''
            ]);
          }
        }
        
        // Add other metrics
        const currentValue = getMetricValue(metric, campaign);
        const targetValue = getMetricTargetValue(metric.name);
        
        campaignDetailsRows.push([
          campaign.campaign_name,
          campaign.campaign_id,
          campaign.overall_status,
          'Campaign',
          metric.name,
          metric.status,
          currentValue,
          targetValue,
          metric.reason || '',
          metric.recommendation || ''
        ]);
        
        // Add to Issues Only if NOT OK
        if (metric.status === 'NOT OK') {
          issuesOnlyRows.push([
            campaign.campaign_name,
            campaign.campaign_id,
            'Campaign',
            metric.name,
            currentValue,
            targetValue,
            metric.reason || '',
            metric.recommendation || ''
          ]);
        }
      }
      
      // Add ad set metrics
      for (const adSet of campaign.ad_sets || []) {
        for (const metric of adSet.metrics || []) {
          // Skip creative metrics
          if (metric.name === 'Creative') continue;
          
          const currentValue = getMetricValue(metric, adSet);
          const targetValue = getMetricTargetValue(metric.name);
          
          campaignDetailsRows.push([
            campaign.campaign_name,
            campaign.campaign_id,
            campaign.overall_status,
            `Ad Set: ${adSet.adset_name}`,
            metric.name,
            metric.status,
            currentValue,
            targetValue,
            metric.reason || '',
            metric.recommendation || ''
          ]);
          
          // Add to Issues Only if NOT OK
          if (metric.status === 'NOT OK') {
            issuesOnlyRows.push([
              campaign.campaign_name,
              campaign.campaign_id,
              `Ad Set: ${adSet.adset_name}`,
              metric.name,
              currentValue,
              targetValue,
              metric.reason || '',
              metric.recommendation || ''
            ]);
          }
        }
        
        // Add ad metrics
        for (const ad of adSet.ads || []) {
          for (const metric of ad.metrics || []) {
            // Skip creative metrics
            if (metric.name === 'Creative') continue;
            
            const currentValue = getMetricValue(metric, ad);
            const targetValue = getMetricTargetValue(metric.name);
            
            campaignDetailsRows.push([
              campaign.campaign_name,
              campaign.campaign_id,
              campaign.overall_status,
              `Ad: ${ad.ad_name}`,
              metric.name,
              metric.status,
              currentValue,
              targetValue,
              metric.reason || '',
              metric.recommendation || ''
            ]);
            
            // Add to Issues Only if NOT OK
            if (metric.status === 'NOT OK') {
              issuesOnlyRows.push([
                campaign.campaign_name,
                campaign.campaign_id,
                `Ad: ${ad.ad_name}`,
                metric.name,
                currentValue,
                targetValue,
                metric.reason || '',
                metric.recommendation || ''
              ]);
            }
          }
        }
      }
    }
    
    // Update Campaign Details sheet with all rows at once
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Campaign Details!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: campaignDetailsRows
      }
    });
    
    // Update Issues Only sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Issues Only!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: issuesOnlyRows
      }
    });
    
    // Add Raw Data sheet with all campaign details
    const rawDataRows = [];
    rawDataRows.push(['Campaign Name', 'Campaign ID', 'Status', 'Level', 'Name', 'Value']);
    
    for (const campaign of analysisReport.campaigns) {
      // Add campaign level data
      rawDataRows.push([
        campaign.campaign_name,
        campaign.campaign_id,
        campaign.overall_status,
        'Campaign',
        'Basic Info',
        JSON.stringify({
          execution_id: campaign.execution_id,
          timestamp: campaign.timestamp
        }, null, 2)
      ]);

      // Add campaign metrics
      for (const metric of campaign.metrics) {
        rawDataRows.push([
          campaign.campaign_name,
          campaign.campaign_id,
          campaign.overall_status,
          'Campaign',
          metric.name,
          JSON.stringify(metric.value, null, 2)
        ]);
      }

      // Add ad set data
      for (const adSet of campaign.ad_sets || []) {
        rawDataRows.push([
          campaign.campaign_name,
          campaign.campaign_id,
          adSet.status,
          `Ad Set: ${adSet.adset_name}`,
          'Basic Info',
          JSON.stringify({
            adset_id: adSet.adset_id,
            adset_name: adSet.adset_name,
            status: adSet.status
          }, null, 2)
        ]);

        // Add ad set metrics
        for (const metric of adSet.metrics) {
          rawDataRows.push([
            campaign.campaign_name,
            campaign.campaign_id,
            adSet.status,
            `Ad Set: ${adSet.adset_name}`,
            metric.name,
            JSON.stringify(metric.value, null, 2)
          ]);
        }

        // Add ad data
        for (const ad of adSet.ads || []) {
          rawDataRows.push([
            campaign.campaign_name,
            campaign.campaign_id,
            ad.status,
            `Ad: ${ad.ad_name}`,
            'Basic Info',
            JSON.stringify({
              ad_id: ad.ad_id,
              ad_name: ad.ad_name,
              status: ad.status
            }, null, 2)
          ]);

          // Add ad metrics
          for (const metric of ad.metrics) {
            rawDataRows.push([
              campaign.campaign_name,
              campaign.campaign_id,
              ad.status,
              `Ad: ${ad.ad_name}`,
              metric.name,
              JSON.stringify(metric.value, null, 2)
            ]);
          }
        }
      }
    }

    // Update Raw Data sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Raw Data!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: rawDataRows
      }
    });

    // Format Raw Data sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: spreadsheet.data.sheets[2].properties.sheetId,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: spreadsheet.data.sheets[2].properties.sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 6
              }
            }
          }
        ]
      }
    });
    
    // 4. Format the spreadsheet
    // Get sheet IDs
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId
    });
    
    const sheetIds = {};
    spreadsheetInfo.data.sheets.forEach(sheet => {
      sheetIds[sheet.properties.title] = sheet.properties.sheetId;
    });
    
    // Apply formatting
    const formattingRequests = [
      // Format Summary sheet title
      {
        repeatCell: {
          range: {
            sheetId: sheetIds['Summary'],
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 2
          },
          cell: {
            userEnteredFormat: {
              textFormat: { bold: true, fontSize: 14 },
              backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
            }
          },
          fields: 'userEnteredFormat(textFormat,backgroundColor)'
        }
      }
    ];

    // Add formatting for each metric group
    for (const group of metricGroups) {
      // First, get all the values from the Summary sheet to find metric rows
      const summaryValues = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Summary!A1:A100'  // Get a large enough range to find all metrics
      });
      
      const metricRows = [];
      
      // Find rows containing each metric name
      if (summaryValues.data && summaryValues.data.values) {
        summaryValues.data.values.forEach((row, index) => {
          if (row[0] && typeof row[0] === 'string') {
            // Check if the row contains any of our metric names
            for (const metric of group.metrics) {
              if (row[0].includes(metric) || row[0].includes(`${metric}s`)) { // Handle plural forms too
                metricRows.push(index);
                break;
              }
            }
          }
        });
      }
      
      // Format Summary sheet - highlight the found metric rows
      for (const rowIndex of metricRows) {
        formattingRequests.push({
          repeatCell: {
            range: {
              sheetId: sheetIds['Summary'],
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 0,
              endColumnIndex: 8
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: group.color
              }
            },
            fields: 'userEnteredFormat(backgroundColor)'
          }
        });
      }

      // Format Campaign Details - conditional format based on metric column
      for (const metric of group.metrics) {
        formattingRequests.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: sheetIds['Campaign Details'],
                startRowIndex: 1  // Skip header
              }],
              booleanRule: {
                condition: {
                  type: 'TEXT_EQ',
                  values: [{ userEnteredValue: metric }]
                },
                format: {
                  backgroundColor: group.color
                }
              }
            },
            index: 0
          }
        });
      }

      // Format Issues Only - conditional format based on metric column
      for (const metric of group.metrics) {
        formattingRequests.push({
          addConditionalFormatRule: {
            rule: {
              ranges: [{
                sheetId: sheetIds['Issues Only'],
                startRowIndex: 1  // Skip header
              }],
              booleanRule: {
                condition: {
                  type: 'TEXT_EQ',
                  values: [{ userEnteredValue: metric }]
                },
                format: {
                  backgroundColor: group.color
                }
              }
            },
            index: 0
          }
        });
      }

      // Format headers for Campaign Details and Issues Only - bold only, no color
      formattingRequests.push(
        {
          repeatCell: {
            range: {
              sheetId: sheetIds['Campaign Details'],
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 10
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true }
              }
            },
            fields: 'userEnteredFormat(textFormat)'
          }
        },
        {
          repeatCell: {
            range: {
              sheetId: sheetIds['Issues Only'],
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 8
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true }
              }
            },
            fields: 'userEnteredFormat(textFormat)'
          }
        }
      );
    }

    // Add conditional formatting for NOT OK status
    formattingRequests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [
            {
              sheetId: sheetIds['Campaign Details'],
              startRowIndex: 1,
              startColumnIndex: 5,
              endColumnIndex: 6
            }
          ],
          booleanRule: {
            condition: {
              type: 'TEXT_EQ',
              values: [{ userEnteredValue: 'NOT OK' }]
            },
            format: {
              backgroundColor: { red: 1.0, green: 0.8, blue: 0.8 }
            }
          }
        },
        index: 0
      }
    });

    // Add auto-resize for all sheets
    formattingRequests.push(
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetIds['Summary'],
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 8
          }
        }
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetIds['Campaign Details'],
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 10
          }
        }
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetIds['Issues Only'],
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 8
          }
        }
      },
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetIds['Raw Data'],
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 6
          }
        }
      }
    );

    // Apply all formatting
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: formattingRequests
      }
    });
    
    // 5. Set sharing permissions (anyone with link can view)
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    // 6. Get the shareable link
    const file = await drive.files.get({
      fileId: spreadsheetId,
      fields: 'webViewLink'
    });
    
    console.log(`✅ Spreadsheet created and shared: ${file.data.webViewLink}`);
    
    return file.data.webViewLink;
  } catch (error) {
    console.error('❌ Error exporting to Google Sheets:', error);
    throw error;
  }
}

/**
 * Get a summary of issues for a specific metric
 * @param {Object} analysisReport - The analysis report
 * @param {string} metricName - The name of the metric
 * @param {boolean} [isNestedMetric=false] - Whether this metric is at the ad set or ad level
 * @returns {string} - Summary text
 */
function getMetricSummary(analysisReport, metricName) {
  let issueCount = 0;
  let totalCount = 0;
  
  for (const campaign of analysisReport.campaigns || []) {
    // Check campaign-level metrics
    for (const metric of campaign.metrics || []) {
      if (metric.name === metricName) {
        totalCount++;
        if (metric.status === 'NOT OK') {
          issueCount++;
        }
      }
    }

    // Check ad set level metrics
    for (const adSet of campaign.ad_sets || []) {
      for (const metric of adSet.metrics || []) {
        if (metric.name === metricName) {
          totalCount++;
          if (metric.status === 'NOT OK') {
            issueCount++;
          }
        }
      }

      // Check ad level metrics
      for (const ad of adSet.ads || []) {
        for (const metric of ad.metrics || []) {
          if (metric.name === metricName) {
            totalCount++;
            if (metric.status === 'NOT OK') {
              issueCount++;
            }
          }
        }
      }
    }
  }
  
  if (totalCount === 0) {
    return 'No data available';
  }
  
  const percentage = ((totalCount - issueCount) / totalCount * 100).toFixed(1);
  return `${issueCount} issues found out of ${totalCount} checked (${percentage}% healthy)`;
}

/**
 * Get the current value of a metric in a human-readable format
 * @param {Object} metric - The metric object
 * @param {Object} entity - The campaign, ad set, or ad object
 * @returns {string} - Formatted current value
 */
function getMetricValue(metric, entity) {
  // If metric has a direct value property that's not an object, return it
  if (metric.value && typeof metric.value !== 'object') {
    return metric.value.toString();
  }

  // Handle object values based on metric name
  switch (metric.name) {
    case 'Attribution Window':
      const windows = Array.isArray(metric.value) ? metric.value : [];
      const has7dClick = windows.includes('7d_click');
      return `${has7dClick ? '✓' : '✗'} ${windows.join(', ')} ${has7dClick ? '(Correct)' : '(Missing 7d_click - Go to Events Manager > Settings > Attribution)'}`;
      
    case 'Budget Distribution':
      if (!metric.value.has_funnel_identifier) {
        return 'Invalid: Missing TOF/MOF/BOF identifiers';
      }
      return `TOF: ${metric.value.tof_percentage}, MOF+BOF: ${metric.value.mof_bof_percentage} (Total: $${metric.value.total_budget})`;
      
    case 'View Click Ratio':
      if (metric.value.campaign_age_days < 1) {
        return 'Campaign too recent (< 1 day)';
      }
      return `Ratio: ${metric.value.ratio} (${metric.value.impressions} impressions / ${metric.value.clicks} clicks)`;
      
    case 'Budget':
      const budget = metric.value || {};
      if (budget.avg_cost_per_conversion > 0) {
        return `Daily: $${budget.daily_budget || 0}, Avg CPA: $${budget.avg_cost_per_conversion.toFixed(2)}`;
      }
      return `Daily: $${budget.daily_budget || 0}, Lifetime: $${budget.lifetime_budget || 0}, No conversion data`;
      
    case 'Optimization Goal':
      return metric.value === 'PURCHASE' ? 'PURCHASE (Recommended)' : metric.value || 'Unknown';
      
    case 'Performance':
      const perf = metric.value || {};
      return `Spend: $${perf.spend || 0}, Clicks: ${perf.clicks || 0}, CTR: ${((perf.ctr || 0) * 100).toFixed(2)}%, CPC: $${perf.cpc || 0}`;
      
    case 'Campaign Age':
      const age = metric.value || {};
      return `${age.age_months || 0} months (started ${age.start_time || 'Unknown'})`;
      
    case 'Placements':
      return metric.value || 'Unknown';
      
    default:
      return JSON.stringify(metric.value) || 'N/A';
  }
}

/**
 * Get the target value for a metric
 * @param {string} metricName - Name of the metric
 * @returns {string} - Target value description
 */
function getMetricTargetValue(metricName) {
  switch (metricName) {
    case 'Attribution Window':
      return '7d_click required (captures full e-commerce purchase cycle)';
      
    case 'Budget Distribution':
      return 'TOF ≥70%, MOF+BOF ≤30% of total budget';
      
    case 'View Click Ratio':
      return 'Impressions/Clicks ratio ≥40 (after 1 day)';
      
    case 'Budget':
      return 'Daily budget > Average Cost per Conversion';
      
    case 'Optimization Goal':
      return 'PURCHASE for e-commerce campaigns';
      
    case 'Performance':
      return 'CTR > 1%, CPC aligned with target CPA';
      
    case 'Campaign Age':
      return 'Active and < 18 months old';
      
    case 'Placements':
      return 'Advantage+ placements recommended for 30% higher ROAS';
      
    default:
      return 'N/A';
  }
}

module.exports = {
  exportToGoogleSheets,
  getAuthClient
}; 