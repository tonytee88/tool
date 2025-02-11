const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // Load Slack credentials from .env

async function main() {
  console.log('🔍 Starting fetch-drawflow.js execution...');

  try {
    // ✅ Get flowId from GitHub Actions environment variable (or default)
    const flowId = process.env.FLOW_ID || "New Flow 01"; 
    console.log(`📡 Fetching drawflow for flowId: ${flowId} from agentFlowCRUD...`);

    // ✅ Fetch flow from MongoDB
    const response = await axios.get(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD`, {
      params: { flowId }
    });

    const flowData = response.data;

    if (!flowData || flowData.length === 0) {
      console.warn(`⚠️ No flow found for flowId: ${flowId}`);
      await sendSlackMessage(`⚠️ No flow found for *${flowId}*. Please check and try again.`);
      process.exit(1); // 🔴 Fail GH Action
    }

    console.log(`✅ Successfully retrieved drawflow data for: ${flowId}`);
    
    // ✅ Save JSON response to a .txt file
    const filePath = path.join(__dirname, 'drawflow.txt');
    fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2)); // Pretty-print JSON

    console.log(`📄 Drawflow file created at: ${filePath}`);

    // ✅ Call execution script **asynchronously**
    try {
      console.log(`🚀 Triggering execute-flow.js for flowId: ${flowId}...`);
      const executeFlow = require("./execute-flow");
      await executeFlow(flowData);  // ✅ Ensures execution completes
      console.log('✅ execute-flow.js completed successfully.');
    } catch (execError) {
      console.error('❌ Error executing execute-flow.js:', execError);
      await sendSlackMessage(`❌ Error executing flow *${flowId}*. Check logs for details.`);
      process.exit(1); // 🔴 Fail GH Action if execution fails
    }

    // ✅ Upload file to Slack
    await uploadFileToSlack(filePath, flowId);

    console.log(`✅ Fetch & Execute Flow completed successfully!`);
    await sendSlackMessage(`✅ Flow *${flowId}* executed successfully! Check the attached drawflow.txt file.`, filePath);

  } catch (error) {
    console.error('❌ Error fetching drawflow:', error);
    await sendSlackMessage(`❌ Error fetching drawflow for *${flowId}*. Check logs for details.`);
    process.exit(1); // 🔴 Fail GH Action
  }
}

// ✅ Uploads a file to Slack
async function uploadFileToSlack(filePath, flowId) {
  try {
    console.log(`📤 Uploading drawflow.txt to Slack for flow: ${flowId}`);

    const slackToken = process.env.SLACK_BOT_TOKEN; // Ensure this is stored in GitHub Secrets
    const slackChannel = process.env.SLACK_CHANNEL_ID || "YOUR_SLACK_CHANNEL_ID";

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('channels', slackChannel);
    formData.append('title', `Drawflow for ${flowId}`);
    formData.append('filename', 'drawflow.txt');
    formData.append('filetype', 'text/plain');

    const response = await axios.post('https://slack.com/api/files.upload', formData, {
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        ...formData.getHeaders(),
      },
    });

    if (!response.data.ok) {
      console.error(`❌ Slack upload failed:`, response.data);
      throw new Error(`Slack upload failed: ${response.data.error}`);
    }

    console.log(`✅ File successfully uploaded to Slack.`);
  } catch (error) {
    console.error('❌ Error uploading file to Slack:', error);
  }
}

// ✅ Sends a message to Slack
async function sendSlackMessage(message, filePath = null) {
  try {
    console.log(`📩 Sending message to Slack: "${message}"`);

    const slackToken = process.env.SLACK_BOT_TOKEN;
    const slackChannel = "C07FXMA353Q" ;

    const payload = {
      channel: slackChannel,
      text: message,
    };

    const response = await axios.post('https://slack.com/api/chat.postMessage', payload, {
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.ok) {
      console.error(`❌ Slack message failed:`, response.data);
      throw new Error(`Slack message failed: ${response.data.error}`);
    }

    console.log(`✅ Message successfully sent to Slack.`);
  } catch (error) {
    console.error('❌ Error sending message to Slack:', error);
  }
}

// ✅ Automatically run the script when executed
main();
