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

  // ✅ Extract proper flow data structure
  flowData = flowData[0].flowData.drawflow;
  const executionOrder = determineExecutionOrder(flowData);
  const storedResponses = {}; // ✅ Cache responses to avoid redundant API calls

  for (const nodeId of executionOrder) {
    const currentNode = flowData.Home.data[nodeId];

    if (!currentNode) continue;

    if (currentNode.name === 'LLM Call') {
      console.log(`🚀 Processing LLM Call Node: ${nodeId}`);

      if (storedResponses[nodeId]) {
        console.log(`✅ Using cached response for Node ${nodeId}`);
        currentNode.data.output = storedResponses[nodeId];
      } else {
        await waitForInputs(nodeId, flowData);

        const combinedInputs = getSortedInputs(nodeId, flowData);
        console.log("📝 Combined Inputs:", combinedInputs);

        const selectedModel = currentNode.data.selectedModel || 'openai/gpt-4o-mini';
        console.log(`📝 Model selected for Node ${nodeId}: ${selectedModel}`);

        try {
          const response = await callLLMAPI(combinedInputs, selectedModel);
          const messageResponse = response.data?.completions?.[selectedModel]?.completion?.choices?.[0]?.message?.content || "⚠️ No valid response";

          console.log(`✅ LLM Call Node (${nodeId}) Response:`, messageResponse);

          currentNode.data.output = messageResponse;
          storedResponses[nodeId] = messageResponse;
          updateOutputNodes(flowData, nodeId, messageResponse);
        } catch (error) {
          console.error(`❌ LLM Call Node (${nodeId}) Error:`, error);
          markNodeAsError(nodeId, error.message);
        }
      }
    } else if (currentNode.name === 'Output') {
      console.log(`📤 Processing Output Node: ${nodeId}`);

      const inputConnections = currentNode.inputs.input_1.connections.map(conn => conn.node);
      const linkedLLMNode = inputConnections.find(id => storedResponses[id]);

      if (linkedLLMNode) {
        const formattedResponse = formatTextAsHTML(storedResponses[linkedLLMNode]);
        currentNode.data.output = formattedResponse;

        console.log(`✅ Output Node (${nodeId}) Displaying:`, formattedResponse);
        updateOutputNodes(flowData, nodeId, formattedResponse);
      } else {
        console.warn(`⚠️ Output Node (${nodeId}) has no valid LLM input.`);
      }
    }
  }

  // ✅ Compile final output from all terminal nodes
  const finalOutputText = compileFinalOutputs(flowData);

  if (finalOutputText) {
    const filePath = generateOutputFile(finalOutputText);
    await sendSlackMessage(channelId, "✅ Here's the final output:", filePath);
  }
}

// ✅ Wait for valid input before proceeding
async function waitForInputs(nodeId, flowData) {
  return new Promise(resolve => {
    const checkInputs = () => {
      if (areInputsReady(nodeId, flowData)) {
        console.log(`✅ Inputs for Node ${nodeId} are now ready!`);
        resolve();
      } else {
        console.log(`⏳ Waiting for inputs for Node ${nodeId}...`);
        setTimeout(checkInputs, 2000);
      }
    };
    checkInputs();
  });
}

// ✅ Ensure inputs are ready before processing
function areInputsReady(nodeId, flowData) {
    const node = flowData.Home.data[nodeId];
  
    if (!node) {
      console.error(`❌ Node ${nodeId} is missing in flowData!`);
      return false;
    }
  
    const inputConnections = Object.values(node.inputs)
      .flatMap(input => input.connections)
      .map(conn => conn.node);
  
    for (const inputNodeId of inputConnections) {
      const inputNode = flowData.Home.data[inputNodeId];
  
      if (!inputNode) {
        console.error(`❌ Node ${inputNodeId} is missing in flowData!`);
        return false;
      }
  
      // ✅ Read directly from the saved flowData, not the UI
      const promptData = inputNode.data?.promptText?.trim() || "";
      const outputData = inputNode.data?.output?.trim() || "";
  
      console.log(`🔍 Checking inputs for Node ${inputNodeId}:`);
      console.log("✅ Output Data:", outputData);
      console.log("✅ Prompt Data:", promptData);
  
      // 🚨 Check each input node type 🚨
      if (inputNode.name === "Prompt") {
        // ✅ Prompt nodes are valid if they have text
        if (!promptData) {
          console.log(`❌ Node ${inputNodeId} is a Prompt but has no text.`);
          return false;
        }
        console.log(`✅ Node ${inputNodeId} is a Prompt. Accepting.`);
        continue;
      } else if (inputNode.name === "LLM Call" || inputNode.name === "Output") {
        // ❌ LLM and Output nodes must have a valid output
        if (!outputData || outputData === "Waiting for response...") {
          console.log(`❌ Node ${nodeId} is waiting for LLM/Output from Node ${inputNodeId}`);
          return false;
        }
      }
    }
  
    console.log(`✅ Node ${nodeId} is ready for execution.`);
    return true;
  }
  

// ✅ Send final output to Slack
async function sendSlackMessage(channelId, message, filePath) {
  console.log(`📩 Sending message to Slack (${channelId})`);
  const slackToken = process.env.SLACK_BOT_TOKEN;

  await axios.post('https://slack.com/api/chat.postMessage', {
    channel: channelId,
    text: message
  }, {
    headers: { 'Authorization': `Bearer ${slackToken}`, 'Content-Type': 'application/json' }
  });

  console.log("✅ Message sent to Slack.");
}

// ✅ Call LLM API
async function callLLMAPI(prompt, model) {
  try {
    const response = await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowStraicoCall', {
      message: prompt,
      models: model
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error calling LLM API: ${error.message}`);
  }
}

function determineExecutionOrder(flowData) {
    const allNodes = flowData.Home.data;
    const executionOrder = [];
    const processedNodes = new Set();
  
    function traverseNode(nodeId) {
      const nodeIdStr = String(nodeId); // Ensure consistent ID format
  
      if (processedNodes.has(nodeIdStr)) {
        console.log("detected node was already processed: " + nodeIdStr)
      return; // ✅ Prevent duplicate visits
      }
  
      const node = allNodes[nodeIdStr];
      if (!node) return;
  
      console.log(`🔍 Analyzing Node: ${nodeIdStr} (${node.name})`);
  
      // Step 1: Process dependencies first (make sure inputs are processed before this node)
      const inputConnections = Object.values(node.inputs)
        .flatMap(input => input.connections)
        .map(conn => String(conn.node)) // Ensure consistency
        .filter(inputNodeId => !processedNodes.has(inputNodeId));
  
      inputConnections.forEach(traverseNode);
  
      // ✅ Only add the node once all inputs have been processed
      if (!processedNodes.has(nodeIdStr)) {
        executionOrder.push(nodeIdStr);
        processedNodes.add(nodeIdStr);
      }
  
      // Step 2: Process connected outputs (ensuring unique visits)
      const outputConnections = Object.values(node.outputs)
        .flatMap(output => output.connections)
        .map(conn => String(conn.node)) // Ensure consistency
        .filter(outputNodeId => !processedNodes.has(outputNodeId));
  
      outputConnections.forEach(traverseNode);
    }
  
    // Get all LLM Call nodes, sort by position, and process them **before** outputs
    const llmNodes = Object.values(allNodes)
      .filter(node => node.name === 'LLM Call')
      .sort((a, b) => a.pos_y === b.pos_y ? a.pos_x - b.pos_x : a.pos_y - b.pos_y);
  
    llmNodes.forEach(llmNode => traverseNode(llmNode.id));
  
    console.log("✅ Final executionOrder:", executionOrder);
    return executionOrder;
  }
  

// ✅ Export function
module.exports = executeLLMFlow;
