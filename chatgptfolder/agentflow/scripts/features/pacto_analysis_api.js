/**
 * PACTO Analysis API Endpoints
 * 
 * This module provides API endpoints for the PACTO analysis functionality.
 */

const express = require('express');
const router = express.Router();
const pactoAnalysis = require('./pacto_analysis');

/**
 * @route POST /api/pacto/analysis
 * @desc Generate a PACTO analysis report for Facebook campaigns
 * @access Private
 */
router.post('/analysis', async (req, res) => {
  try {
    const { accountId, timeframe, campaignId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId is required'
      });
    }
    
    const options = {
      accountId,
      timeframe: timeframe || 'last_30d',
      campaignId
    };
    
    console.log(`📊 API Request: Generate PACTO analysis for account ${accountId}`);
    
    const result = await pactoAnalysis.generateAnalysisReport(options);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    return res.json({
      success: true,
      data: result.report
    });
  } catch (error) {
    console.error(`❌ API Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/pacto/campaign-analysis
 * @desc Generate a PACTO analysis report for a specific Facebook campaign
 * @access Private
 */
router.post('/campaign-analysis', async (req, res) => {
  try {
    const { accountId, campaignId, timeframe } = req.body;
    
    if (!accountId || !campaignId) {
      return res.status(400).json({
        success: false,
        error: 'accountId and campaignId are required'
      });
    }
    
    const options = {
      accountId,
      campaignId,
      timeframe: timeframe || 'last_30d'
    };
    
    console.log(`📊 API Request: Generate PACTO analysis for campaign ${campaignId}`);
    
    const result = await pactoAnalysis.getCampaignAnalysis(options);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    return res.json({
      success: true,
      data: result.report
    });
  } catch (error) {
    console.error(`❌ API Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @api {post} /api/pacto/export-analysis Export PACTO analysis report to Google Sheets
 * @apiName ExportPactoAnalysis
 * @apiGroup PACTO
 * @apiDescription Generate a PACTO analysis report for Facebook campaigns and export to Google Sheets
 *
 * @apiParam {String} accountId Facebook Ad Account ID
 * @apiParam {String} [timeframe='last_30d'] Time range for data analysis
 * @apiParam {String} [campaignId] Optional campaign ID to analyze
 *
 * @apiSuccess {Boolean} success Indicates if the operation was successful
 * @apiSuccess {String} spreadsheet_url URL of the created Google Sheet
 * @apiSuccess {Object} report The analysis report data
 */
router.post('/export-analysis', async (req, res) => {
  try {
    const { accountId, timeframe = 'last_30d', campaignId } = req.body;
    
    // Validate required parameters
    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: accountId'
      });
    }
    
    console.log(`📊 Exporting PACTO analysis for account ${accountId} to Google Sheets...`);
    
    // Generate and export the analysis report
    const result = await pactoAnalysis.generateAndExportAnalysisReport(accountId, timeframe, campaignId);
    
    if (result.success) {
      return res.json({
        success: true,
        spreadsheet_url: result.spreadsheet_url,
        report: result.report
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error in export-analysis endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @api {post} /api/pacto/export-campaign-analysis Export PACTO analysis for a specific campaign to Google Sheets
 * @apiName ExportPactoCampaignAnalysis
 * @apiGroup PACTO
 * @apiDescription Generate a PACTO analysis report for a specific Facebook campaign and export to Google Sheets
 *
 * @apiParam {String} accountId Facebook Ad Account ID
 * @apiParam {String} campaignId Campaign ID to analyze
 * @apiParam {String} [timeframe='last_30d'] Time range for data analysis
 *
 * @apiSuccess {Boolean} success Indicates if the operation was successful
 * @apiSuccess {String} spreadsheet_url URL of the created Google Sheet
 * @apiSuccess {Object} report The analysis report data
 */
router.post('/export-campaign-analysis', async (req, res) => {
  try {
    const { accountId, campaignId, timeframe = 'last_30d' } = req.body;
    
    // Validate required parameters
    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: accountId'
      });
    }
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: campaignId'
      });
    }
    
    console.log(`📊 Exporting PACTO analysis for campaign ${campaignId} to Google Sheets...`);
    
    // Generate and export the analysis report for the specific campaign
    const result = await pactoAnalysis.generateAndExportAnalysisReport(accountId, timeframe, campaignId);
    
    if (result.success) {
      return res.json({
        success: true,
        spreadsheet_url: result.spreadsheet_url,
        report: result.report
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Error in export-campaign-analysis endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 