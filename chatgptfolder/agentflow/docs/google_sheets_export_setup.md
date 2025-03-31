# Google Sheets Export Setup Guide

This guide provides step-by-step instructions for setting up the Google Sheets export functionality for PACTO Analysis reports.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Basic familiarity with Google Cloud services

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "PACTO Analysis")
5. Click "Create"
6. Wait for the project to be created and then select it from the dropdown

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Google Sheets API
   - Google Drive API

For each API:
1. Click on the API in the search results
2. Click "Enable"
3. Wait for the API to be enabled

## Step 3: Create a Service Account

1. In the Google Cloud Console, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a service account name (e.g., "pacto-sheets-export")
4. (Optional) Enter a description (e.g., "Service account for exporting PACTO analysis to Google Sheets")
5. Click "Create and Continue"
6. For the "Grant this service account access to project" step:
   - Select "Basic" > "Editor" role
   - Click "Continue"
7. For the "Grant users access to this service account" step:
   - You can skip this step for now
   - Click "Done"

## Step 4: Create and Download Service Account Key

1. In the service accounts list, find the service account you just created
2. Click the three dots menu (⋮) at the end of the row
3. Select "Manage keys"
4. Click "Add Key" > "Create new key"
5. Select "JSON" as the key type
6. Click "Create"
7. The key file will be automatically downloaded to your computer
8. Keep this file secure, as it grants access to your Google account!

## Step 5: Configure Your Application

1. Create a `config` directory in your project root if it doesn't exist already
2. Copy the downloaded JSON key file to `config/google-service-account.json`
3. Alternatively, set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to the path of your key file:

   ```bash
   # Linux/macOS
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key-file.json"
   
   # Windows (Command Prompt)
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-key-file.json
   
   # Windows (PowerShell)
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your-key-file.json"
   ```

## Step 6: (Optional) Share Your Google Drive Folder

If you want to organize the exported spreadsheets in a specific folder:

1. Create a folder in your Google Drive
2. Right-click the folder and select "Share"
3. Add the service account email address (found in the JSON key file as `client_email`)
4. Give it "Editor" access
5. Click "Share"

## Step 7: Test the Export Functionality

1. Run the test script to verify that everything is working correctly:

   ```bash
   node scripts/features/google_sheets_export_test.js
   ```

2. If successful, you should see a message with the URL of the created spreadsheet
3. Open the URL in your browser to view the exported report

## Troubleshooting

### Authentication Issues

- Verify that the service account key file is correctly formatted and contains all required fields
- Check that the `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set correctly (if using)
- Ensure that the Google Sheets API and Google Drive API are enabled for your project

### Permission Issues

- Make sure the service account has the necessary permissions (Editor role)
- If using a specific folder, ensure the service account has been granted access to it

### API Quota Issues

- Google APIs have usage quotas. If you're making many requests, you might hit these limits
- Consider implementing rate limiting or batching in your application
- For production use, you may need to request higher quotas from Google

## Security Considerations

- The service account key grants access to your Google account. Keep it secure!
- Do not commit the key file to version control
- Consider using environment variables or a secure secrets management system in production
- Regularly rotate your service account keys for enhanced security

## Next Steps

After setting up the Google Sheets export functionality, you can:

1. Customize the spreadsheet formatting to match your branding
2. Add additional tabs or visualizations to the exported spreadsheets
3. Implement scheduled exports for regular reporting
4. Create a user interface for triggering exports and managing spreadsheets 