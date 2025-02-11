const fs = require('fs');
const path = require('path');
const axios = require('axios');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Get flowId from query params (e.g., ?flowId=New Flow 01)
    const { flowId } = req.query;
    if (!flowId) {
      return res.status(400).json({ error: 'flowId query parameter is required' });
    }

    // ✅ Fetch the correct flow from MongoDB (via agentFlowCRUD)
    const response = await axios.get(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD`, {
      params: { flowId }
    });

    const flowData = response.data;

    if (!flowData || flowData.length === 0) {
      return res.status(404).json({ error: `No flow found for flowId: ${flowId}` });
    }

    // ✅ Convert JSON response to a readable .txt format
    const filePath = path.join('/tmp', 'drawflow.txt');
    const formattedFlowData = JSON.stringify(flowData, null, 2); // Pretty-print JSON
    fs.writeFileSync(filePath, formattedFlowData);

    console.log(`✅ Drawflow file created: ${filePath}`);

    // ✅ Call the execution script (pass the fetched flowData)
    require("./execute-flow")(flowData);

    // ✅ Send a message with the file to Slack
    return res.status(200).json({
      response_type: 'in_channel',
      text: `📄 Here is your Drawflow file for *${flowId}*:`,
      attachments: [
        {
          title: 'drawflow.txt',
          filetype: 'text/plain',
          url_private: filePath
        }
      ]
    });

  } catch (error) {
    console.error('❌ Error fetching drawflow:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = handler;
