# PACTO Analysis for Facebook Campaigns

PACTO Analysis is a comprehensive tool for analyzing Facebook campaigns based on best practices and predefined rules. It helps identify issues and provides recommendations for improving campaign performance.

## Analysis Rules

PACTO Analysis checks the following metrics:

### 1. Attribution Window

**Metric**: Selected attribution window (e.g., 7-day click / 1-day view)

**Rule**: For e-commerce, 7-day click attribution is recommended

### 2. Campaign Budget

**Metric**: Budget amount

**Rule**: Compare to the average cost per conversion and verify if it's sufficient to generate at least 1 conversion

**Correction**: Adjust if the budget is too low or not adapted to the objective

### 3. Campaign Age

**Metric**: Launch and end dates

**Rule**: A campaign that's too old (>18 months) can lead to decreased performance

**Correction**: Close old campaigns and launch new ones

### 4. Placements

**Metric**: Automatic or manual placements

**Rule**: Automatic placements are recommended to maximize distribution and reduce CPM

**Correction**: Switch to automatic if performance is average or poor

### 5. Optimization Goal

**Metric**: "Optimization for ad delivery"

**Rule**: Verify that optimization is set for the final objective (e.g., Purchase for e-commerce)

### 6. Audience Count

**Metric**: Number of audiences per ad set

**Rule**: Should be fewer than 4

### 7. Creative Count

**Metric**: Number of creatives per ad

**Rule**: Should be fewer than 4

## API Endpoints

### Generate Analysis Report

Generates a comprehensive analysis report for all campaigns in an account.

**Endpoint**: `POST /api/pacto/analysis`

**Request Body**:
```json
{
  "accountId": "your_facebook_account_id",
  "timeframe": "last_30d"  // Optional, defaults to last_30d
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2023-05-15T14:30:00Z",
    "account_id": "your_facebook_account_id",
    "summary": {
      "total_campaigns": 10,
      "campaigns_with_issues": 3,
      "total_issues": 7
    },
    "campaigns": [
      // Campaign objects with analysis results
    ]
  }
}
```

### Generate Campaign Analysis

Generates an analysis report for a specific campaign.

**Endpoint**: `POST /api/pacto/campaign-analysis`

**Request Body**:
```json
{
  "accountId": "your_facebook_account_id",
  "campaignId": "your_campaign_id",
  "timeframe": "last_30d"  // Optional, defaults to last_30d
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2023-05-15T14:30:00Z",
    "account_id": "your_facebook_account_id",
    "summary": {
      "total_campaigns": 1,
      "campaigns_with_issues": 0,
      "total_issues": 0
    },
    "campaigns": [
      // Campaign object with analysis results
    ]
  }
}
```

## Response Structure

The analysis report has the following structure:

```json
{
  "timestamp": "2023-05-15T14:30:00Z",
  "account_id": "your_facebook_account_id",
  "summary": {
    "total_campaigns": 10,
    "campaigns_with_issues": 3,
    "total_issues": 7
  },
  "campaigns": [
    {
      "campaign_id": "123456789",
      "campaign_name": "Campaign A",
      "overall_status": "NEEDS ATTENTION",
      "metrics": [
        {
          "name": "Attribution Window",
          "status": "NOT OK",
          "reason": "Wrong attribution window (1d click instead of 7d click)",
          "recommendation": "Change to 7-day click attribution"
        },
        {
          "name": "Budget",
          "status": "OK",
          "reason": "",
          "recommendation": ""
        },
        // Other campaign-level metrics
      ],
      "ad_sets": [
        {
          "adset_id": "987654321",
          "adset_name": "Ad Set 1",
          "metrics": [
            {
              "name": "Audience Count",
              "status": "NOT OK",
              "reason": "Too many audiences (5)",
              "recommendation": "Reduce to fewer than 4 audiences"
            }
          ],
          "ads": [
            {
              "ad_id": "111222333",
              "ad_name": "Ad 1",
              "metrics": [
                {
                  "name": "Creative Count",
                  "status": "NOT OK",
                  "reason": "Too many creatives (6)",
                  "recommendation": "Reduce to fewer than 4 creatives"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Interpreting Results

- **Overall Status**: Each campaign has an overall status of either "OK" or "NEEDS ATTENTION".
- **Metrics**: Each metric has a status of either "OK" or "NOT OK".
- **Reason**: If a metric is "NOT OK", the reason explains why.
- **Recommendation**: If a metric is "NOT OK", the recommendation suggests how to fix the issue.

## Usage Example

```javascript
// Example: Generate analysis report for an account
const response = await fetch('/api/pacto/analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    accountId: '1234567890',
    timeframe: 'last_30d'
  })
});

const result = await response.json();

if (result.success) {
  // Process the analysis report
  const report = result.data;
  console.log(`Found ${report.summary.campaigns_with_issues} campaigns with issues`);
} else {
  console.error('Error:', result.error);
}
```

## Google Sheets Export

The PACTO Analysis system includes functionality to export analysis reports to Google Sheets, making it easy to share and collaborate on campaign analysis.

### Export Features

- **Comprehensive Spreadsheet**: The exported Google Sheet includes three tabs:
  - **Summary**: Overview of the analysis with key metrics and issue counts
  - **Campaign Details**: Complete breakdown of all campaigns, ad sets, and ads with their metrics
  - **Issues Only**: Filtered view showing only the items with issues that need attention

- **Formatting**: The spreadsheet includes professional formatting with:
  - Color-coded status indicators
  - Bold headers
  - Auto-sized columns
  - Conditional formatting for issues

- **Sharing**: The spreadsheet is automatically shared with "anyone with the link" for easy access

### Using the Export Functionality

#### Programmatically

```javascript
const pactoAnalysis = require('./features/pacto_analysis');

async function exportAnalysisToGoogleSheets() {
  const accountId = '1234567890'; // Your Facebook Ad Account ID
  const timeframe = 'last_30d';
  
  // Export all campaigns
  const result = await pactoAnalysis.generateAndExportAnalysisReport(accountId, timeframe);
  
  if (result.success) {
    console.log(`Spreadsheet URL: ${result.spreadsheet_url}`);
    // You can now share this URL with stakeholders
  } else {
    console.error(`Export failed: ${result.error}`);
  }
  
  // Export a specific campaign
  const campaignId = '1234567890123456';
  const campaignResult = await pactoAnalysis.generateAndExportAnalysisReport(accountId, timeframe, campaignId);
  
  if (campaignResult.success) {
    console.log(`Campaign spreadsheet URL: ${campaignResult.spreadsheet_url}`);
  }
}
```

#### API Endpoints

Two new API endpoints are available for exporting analysis reports to Google Sheets:

##### 1. Export All Campaigns

```
POST /api/pacto/export-analysis
```

**Request Body:**
```json
{
  "accountId": "1234567890",
  "timeframe": "last_30d"
}
```

**Response:**
```json
{
  "success": true,
  "spreadsheet_url": "https://docs.google.com/spreadsheets/d/abc123/edit",
  "report": {
    // The full analysis report data
  }
}
```

##### 2. Export Specific Campaign

```
POST /api/pacto/export-campaign-analysis
```

**Request Body:**
```json
{
  "accountId": "1234567890",
  "campaignId": "1234567890123456",
  "timeframe": "last_30d"
}
```

**Response:**
```json
{
  "success": true,
  "spreadsheet_url": "https://docs.google.com/spreadsheets/d/xyz789/edit",
  "report": {
    // The campaign analysis report data
  }
}
```

### Authentication Setup

To use the Google Sheets export functionality, you need to set up a service account:

1. Create a Google Cloud project and enable the Google Sheets API and Google Drive API
2. Create a service account and download the JSON key file
3. Place the key file in the `config/google-service-account.json` path or set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your key file

### Spreadsheet Structure

The exported spreadsheet contains:

1. **Summary Tab**:
   - Account information and timestamp
   - Total campaigns, campaigns with issues, and total issues
   - Quick summary of each metric with issue counts

2. **Campaign Details Tab**:
   - Complete breakdown of all campaigns, ad sets, and ads
   - Metrics for each level with status, reason, and recommendation
   - Color-coded status indicators

3. **Issues Only Tab**:
   - Filtered view showing only items with issues
   - Organized by campaign, ad set, and ad
   - Includes reason and recommendation for each issue 