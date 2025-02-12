const fs = require('fs');
const path = require('path');
const axios = require('axios');

const channelId = process.env.SLACK_CHANNEL_ID || "x"; // 🔹 Capture dynamically

async function executeLLMFlow(flowData) {
  console.log("🚀 Starting Flow Execution...");

  if (!flowData || !flowData.length) {
    console.error("❌ No valid flowData received.");
    return;
  }

  // ✅ Extract proper flow data structure
  flowData = flowData[0].flowData; 
  const executionOrder = determineExecutionOrder(flowData);
  const storedResponses = {}; // ✅ Cache responses to avoid redundant API calls
  const executionQueue = [...executionOrder]; // ✅ Queue-based execution

  while (executionQueue.length > 0) {
    const nodeId = executionQueue.shift();
    const currentNode = flowData.drawflow.Home.data[nodeId];

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
          const messageResponse = response.data?.completion?.choices?.[0]?.message?.content || "⚠️ No valid response";

          console.log(`✅ LLM Call Node (${nodeId}) Response:`, messageResponse);

          currentNode.data.output = messageResponse;
          storedResponses[nodeId] = messageResponse;
          updateOutputNodes(flowData, nodeId, messageResponse);

          enqueueConnectedNodes(nodeId, flowData, executionQueue);
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

// ✅ Check if a node's inputs are ready
function areInputsReady(nodeId, flowData) {
  const node = flowData.drawflow.Home.data[nodeId];

  const inputConnections = Object.values(node.inputs)
    .flatMap(input => input.connections)
    .map(conn => conn.node);

  for (const inputNodeId of inputConnections) {
    const inputNode = flowData.drawflow.Home.data[inputNodeId];

    let outputData = inputNode?.data?.output?.trim() || "";

    if (!outputData || outputData === "Waiting for response...") {
      console.log(`❌ Node ${nodeId} is waiting for input from Node ${inputNodeId}`);
      return false;
    }
  }
  return true;
}

// ✅ Generates output file
function generateOutputFile(outputText) {
  const filePath = path.join('/tmp', 'final_output.txt');
  fs.writeFileSync(filePath, outputText, 'utf8');
  return filePath;
}

// ✅ Updates output node data
function updateOutputNodes(flowData, nodeId, responseText) {
  flowData.drawflow.Home.data[nodeId].data.output = responseText;
}

// ✅ Sorts execution order
function determineExecutionOrder(flowData) {
  const allNodes = flowData.drawflow.Home.data;
  const executionOrder = [];
  const processedNodes = new Set();

  function traverseNode(nodeId) {
    const nodeIdStr = String(nodeId);

    if (processedNodes.has(nodeIdStr)) return;

    const node = allNodes[nodeIdStr];
    if (!node) return;

    const inputConnections = Object.values(node.inputs)
      .flatMap(input => input.connections)
      .map(conn => String(conn.node))
      .filter(inputNodeId => !processedNodes.has(inputNodeId));

    inputConnections.forEach(traverseNode);

    if (!processedNodes.has(nodeIdStr)) {
      executionOrder.push(nodeIdStr);
      processedNodes.add(nodeIdStr);
    }

    const outputConnections = Object.values(node.outputs)
      .flatMap(output => output.connections)
      .map(conn => String(conn.node))
      .filter(outputNodeId => !processedNodes.has(outputNodeId));

    outputConnections.forEach(traverseNode);
  }

  const llmNodes = Object.values(allNodes)
    .filter(node => node.name === 'LLM Call')
    .sort((a, b) => a.pos_y === b.pos_y ? a.pos_x - b.pos_x : a.pos_y - b.pos_y);

  llmNodes.forEach(llmNode => traverseNode(llmNode.id));

  return executionOrder;
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

// ✅ Send Slack Message
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

// ✅ Export function
module.exports = executeLLMFlow;
