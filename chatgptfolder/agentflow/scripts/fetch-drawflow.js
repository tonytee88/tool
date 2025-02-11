const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
      process.exit(1); // 🔴 Fail GH Action if execution fails
    }

    console.log(`✅ Fetch & Execute Flow completed successfully!`);
  } catch (error) {
    console.error('❌ Error fetching drawflow:', error);
    process.exit(1); // 🔴 Fail GH Action
  }
}

// ✅ Automatically run the script when executed
main();
