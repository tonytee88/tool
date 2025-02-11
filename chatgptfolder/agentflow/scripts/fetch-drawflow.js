require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function main() {
  console.log('🔍 Starting fetch-drawflow.js execution...');

  try {
    // ✅ Get flowId & channelId from GitHub Action request
    const flowId = process.env.FLOW_ID || "x";
    const channelId = process.env.SLACK_CHANNEL_ID || "x" ; // 🔹 Capture dynamically
    console.log(channelId);
    console.log("flowid loaded from env : "+ flowId)
    if (!flowId || !channelId) {
      console.error('❌ Missing flowId or channelId');
      process.exit(1); // 🔴 Fail GH Action
    }

    console.log(`📡 Fetching drawflow for flowId: ${flowId}...`);
    const response = await axios.get(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${encodeURIComponent(flowId)}`);
    console.log("drawflow data: " + JSON.stringify(response));

    const flowData = response.data;
    if (!flowData || flowData.length === 0) {
      console.warn(`⚠️ No flow found for flowId: ${flowId}`);
      await sendSlackMessage(channelId, `⚠️ No flow found for *${flowId}*. Please check and try again.`);
      process.exit(1);
    }

    console.log(`✅ Successfully retrieved drawflow data for: ${flowId}`);

    // ✅ Save JSON response to .txt file
    const filePath = path.join(__dirname, 'drawflow.txt');
    fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2));

    console.log(`📄 Drawflow file created at: ${filePath}`);

    // ✅ Call execution script
    try {
      console.log(`🚀 Triggering execute-flow.js for flowId: ${flowId}...`);
      const executeFlow = require("./execute-flow");
      await executeFlow(flowData);
      console.log('✅ execute-flow.js completed successfully.');
    } catch (execError) {
      console.error('❌ Error executing execute-flow.js:', execError);
      await sendSlackMessage(channelId, `❌ Error executing flow *${flowId}*. Check logs.`);
      process.exit(1);
    }

    // ✅ Upload file to Slack (to correct channel)
    await uploadFileToSlack(filePath, flowId, channelId);
    await sendSlackMessage(channelId, `✅ Flow *${flowId}* executed successfully!`, filePath);

    console.log(`✅ Fetch & Execute Flow completed successfully!`);

  } catch (error) {
    console.error('❌ Error fetching drawflow:', error);
    await sendSlackMessage(channelId, `❌ Error fetching drawflow for *${flowId}*. Check logs.`);
    process.exit(1);
  }
}

// ✅ Uploads a file to Slack
async function uploadFileToSlack(filePath, flowId, channelId) {
  try {
    console.log(`📤 Uploading drawflow.txt to Slack in channel: ${channelId}`);

    const slackToken = process.env.SLACK_BOT_TOKEN;

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('channels', channelId);
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

// ✅ Sends a message to Slack (to correct channel)
async function sendSlackMessage(channelId, message, filePath = null) {
  try {
    console.log(`📩 Sending message to Slack Channel (${channelId}): "${message}"`);

    const slackToken = process.env.SLACK_BOT_TOKEN;

    const payload = {
      channel: channelId,
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
