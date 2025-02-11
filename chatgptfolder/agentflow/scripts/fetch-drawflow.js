const axios = require('axios');
const fs = require('fs');

const flowName = process.argv[2];

if (!flowName) {
  console.error("❌ Missing flow name argument");
  process.exit(1);
}

(async () => {
  try {
    console.log(`📡 Fetching flow data for: ${flowName}`);

    const response = await axios.get(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${flowName}`);

    if (response.status !== 200) {
      throw new Error(`Failed to retrieve flow data (HTTP ${response.status})`);
    }

    const flowData = response.data;
    
    if (!flowData || flowData.length === 0) {
      throw new Error("Empty flow data received");
    }

    fs.writeFileSync('flow-data.json', JSON.stringify(flowData, null, 2));
    console.log("✅ Flow data saved as flow-data.json");

    // Call the execution script
    require("./execute-flow")(flowData);

  } catch (error) {
    console.error("❌ Error fetching flow data:", error.message);
    process.exit(1);
  }
})();
