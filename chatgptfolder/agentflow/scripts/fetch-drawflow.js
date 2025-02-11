const fs = require('fs');
const path = require('path');
const axios = require('axios');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Fetch Drawflow JSON from the correct MongoDB endpoint
    const response = await axios.get('https://j7-magic-tool.vercel.app/api/agentFlowCRUD');
    const flowData = response.data;

    if (!flowData) {
      return res.status(404).json({ error: 'No flow data found' });
    }

    // ✅ Convert JSON to a .txt file
    const filePath = path.join('/tmp', 'drawflow.txt');
    fs.writeFileSync(filePath, JSON.stringify(flowData, null, 2));

    console.log('✅ Drawflow file created:', filePath);

    // ✅ Call the execution script
    require("./execute-flow")(flowData);

    // ✅ Send a message with the file in Slack
    return res.status(200).json({
      response_type: 'in_channel',
      text: '📄 Here is your Drawflow file:',
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
