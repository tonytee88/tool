require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const flowId = process.env.FLOW_ID || "x";
const channelId = process.env.SLACK_CHANNEL_ID || "x" ; // 🔹 Capture dynamically

async function main() {
  console.log('🔍 Starting fetch-drawflow.js execution...');

  try {
    // ✅ Get flowId & channelId from GitHub Action request

    if (!flowId || !channelId) {
      console.error('❌ Missing flowId or channelId');
      process.exit(1); // 🔴 Fail GH Action
    }

    console.log(`📡 Fetching drawflow for flowId: ${flowId}...`);
    const response = await axios.get(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${encodeURIComponent(flowId)}`);
    //console.log("drawflow data: " + JSON.stringify(response.data, null, 2));

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
      if (slackInput) {
        injectSlackInput(flowData, slackInput);
      }
      const executeFlow = require("./execute-flow");
      await executeFlow(flowData);
      console.log('✅ execute-flow.js completed successfully.');
    } catch (execError) {
      console.error('❌ Error executing execute-flow.js:', execError);
      await sendSlackMessage(channelId, `❌ Error executing flow *${flowId}*. Check logs.`);
      process.exit(1);
    }

    // ✅ Upload file to Slack (to correct channel)
    await uploadFileToSlack(filePath, channelId);
    await sendSlackMessage(channelId, `✅ Flow *${flowId}* executed successfully!`, filePath);

    console.log(`✅ Fetch & Execute Flow completed successfully!`);

  } catch (error) {
    console.error('❌ Error fetching drawflow:', error);
    await sendSlackMessage(channelId, `❌ Error fetching drawflow for *${flowId}*. Check logs.`);
    process.exit(1);
  }
}

// ✅ Uploads a file to Slack
async function uploadFileToSlack(filePath, channels) {
    const token = process.env.SLACK_BOT_TOKEN;

    try {
      // Step 1: Request an upload URL
      const uploadUrlResponse = await axios.post(
        'https://slack.com/api/files.getUploadURLExternal',
        {
          length: fs.statSync(filePath).size,
          filename: 'your_filename.ext', // Replace with your file's name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!uploadUrlResponse.data.ok) {
        throw new Error(`Error getting upload URL: ${uploadUrlResponse.data.error}`);
      }
  
      const uploadUrl = uploadUrlResponse.data.upload_url;
      const fileId = uploadUrlResponse.data.file_id;
  
      // Step 2: Upload the file
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
  
      const uploadResponse = await axios.post(uploadUrl, form, {
        headers: form.getHeaders(),
      });
  
      if (uploadResponse.status !== 200) {
        throw new Error('Error uploading file to the provided URL');
      }
  
      // Step 3: Complete the upload
      const completeResponse = await axios.post(
        'https://slack.com/api/files.completeUploadExternal',
        {
          files: [
            {
              id: fileId,
              title: 'Your File Title', // Replace with your file's title
            },
          ],
          channels: channels, // Array of channel IDs where the file will be shared
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!completeResponse.data.ok) {
        throw new Error(`Error completing upload: ${completeResponse.data.error}`);
      }
  
      console.log('File uploaded successfully:', completeResponse.data.file);
    } catch (error) {
      console.error('Error uploading file to Slack:', error);
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
