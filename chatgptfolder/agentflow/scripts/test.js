const fs = require('fs');
const path = require('path');
const axios = require('axios');
const channelId = process.env.SLACK_CHANNEL_ID || "x"; // Capture dynamically

async function executeLLMFlow(flowData) {
    console.log("🚀 Starting Flow Execution...");
  
    if (!flowData || !flowData.length) {
      console.error("❌ No valid flowData received.");
      return;
    }
  
    const structuredFlow = flowData[0]?.flowData?.drawflow?.Home?.data || flowData[0]?.flowData?.drawflow?.data;
    if (!structuredFlow || typeof structuredFlow !== "object") {
        console.error("❌ Invalid flowData format! Expected an object but got:", structuredFlow);
        return;
    }
    
    console.log("✅ Valid structured flow data loaded!");

    const executionId = `exec_${Date.now()}`; // 🌟 Generate unique executionId
    console.log("🔄 Generated Execution ID:", executionId); // 🌟 Debugging executionId

    const executionOrder = determineExecutionOrder(structuredFlow);
    const storedResponses = {}; 
  
    for (const nodeId of executionOrder) {
      const currentNode = structuredFlow[nodeId];
      if (!currentNode) continue;
  
      if (currentNode.name === 'LLM Call') {
        console.log(`🚀 Processing LLM Call Node: ${nodeId}`);
  
        if (storedResponses[nodeId]) { 
          console.log(`✅ Using cached response for Node ${nodeId}`);
          currentNode.data.output = storedResponses[nodeId];
        } else {
          await waitForInputs(nodeId, structuredFlow);
  
          const combinedInputs = getSortedInputs(nodeId, structuredFlow);
          console.log("📝 Combined Inputs:", combinedInputs);
  
          const selectedModel = currentNode.data.selectedModel || 'openai/gpt-4o-mini';
          console.log(`📝 Model selected for Node ${nodeId}: ${selectedModel}`);
  
          try {
            const response = await callLLMAPI(combinedInputs, selectedModel);
            const messageResponse = response.data?.completions?.[selectedModel]?.completion?.choices?.[0]?.message?.content || "⚠️ No valid response";
  
            console.log(`✅ LLM Call Node (${nodeId}) Response:`, messageResponse);
  
            currentNode.data.output = messageResponse;
            storedResponses[nodeId] = messageResponse;
            updateOutputNodes(structuredFlow, nodeId, messageResponse);
  
            // 🌟 Store response in MongoDB using agentFlowCRUD.js 🌟
            await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
              flowId: executionId, // 🌟 Unique execution ID
              nodeId, // 🌟 Output node ID
              content: messageResponse,
              timestamp: new Date().toISOString() // 🌟 Add timestamp for cleanup
            });
            console.log(`📤 Stored response for Execution ID: ${executionId}, Output ID: ${nodeId}`);
  
          } catch (error) {
            console.error(`❌ LLM Call Node (${nodeId}) Error:`, error);
            markNodeAsError(nodeId, error.message);
          }
        }
      }
    }
}

module.exports = executeLLMFlow;
