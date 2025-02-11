const fs = require('fs');

module.exports = async function executeFlow(flowData) {
  console.log("🚀 Starting Drawflow Execution...");
  
  const drawflowExport = flowData[0]?.flowData?.drawflow?.Home?.data;
  if (!drawflowExport) {
    console.error("❌ Invalid drawflow structure");
    process.exit(1);
  }

  // Determine execution order
  const executionOrder = Object.keys(drawflowExport)
    .filter(nodeId => drawflowExport[nodeId].name === "LLM Call");

  console.log("📋 Execution Order:", executionOrder);

  for (const nodeId of executionOrder) {
    const node = drawflowExport[nodeId];

    console.log(`🔍 Processing Node ${nodeId}: ${node.name}`);

    try {
      const response = await callLLMAPI(node.data.promptText, node.data.selectedModel);
      const output = response.data.completions[node.data.selectedModel].completion.choices[0].message.content;

      console.log(`✅ Node ${nodeId} response:`, output);

      // Save result in drawflow structure
      drawflowExport[nodeId].data.output = output;

    } catch (error) {
      console.error(`❌ Error processing Node ${nodeId}:`, error.message);
    }
  }

  // Save results
  fs.writeFileSync('execution-results.json', JSON.stringify(drawflowExport, null, 2));
  console.log("✅ Execution completed. Results saved.");
};

// Helper function to call LLM API
async function callLLMAPI(prompt, model) {
  const axios = require('axios');

  try {
    const response = await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowStraicoCall', {
      message: prompt,
      models: model
    });

    if (!response.data || !response.data.completions) {
      throw new Error("Invalid API response");
    }

    return response.data;
  } catch (error) {
    throw new Error(`Error calling LLM API: ${error.message}`);
  }
}
