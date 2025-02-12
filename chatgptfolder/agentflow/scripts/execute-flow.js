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

  flowData = flowData[0]; // Ensure we're working with the actual flow object
  const executionOrder = determineExecutionOrder(flowData);
  const storedResponses = {}; // ✅ Cache responses to avoid redundant API calls
  const executionQueue = [...executionOrder]; // ✅ Queue-based execution

  while (executionQueue.length > 0) {
    const nodeId = executionQueue.shift();
    const currentNode = flowData.flowData.drawflow.Home.data[nodeId];

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

// ✅ Find nodes that should execute next
function enqueueConnectedNodes(nodeId, flowData, queue) {
  const currentNode = flowData.flowData.drawflow.Home.data[nodeId];
  if (!currentNode) return;

  const outputConnections = Object.values(currentNode.outputs)
    .flatMap(output => output.connections)
    .map(conn => conn.node);

  outputConnections.forEach(nextNodeId => {
    if (!queue.includes(nextNodeId)) queue.push(nextNodeId);
  });
}

// ✅ Extract final outputs
function compileFinalOutputs(flowData) {
  const allNodes = flowData.flowData.drawflow.Home.data;
  let finalOutputText = "";

  Object.values(allNodes).forEach(node => {
    if (node.name === "Output" && node.outputs.output_1.connections.length === 0) {
      console.log(`📌 Final Output Node Detected: ${node.id}`);
      finalOutputText += `${node.data.output || "No output generated"}\n\n`;
    }
  });

  return finalOutputText.trim();
}

// ✅ Sort execution order
function determineExecutionOrder(flowData) {
  const allNodes = flowData.flowData.drawflow.Home.data;
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
  console.log("🔍 Calling LLM API with model:", model);
  try {
    const response = await axios.post('https://j7-magic-tool.vercel.app/api/agentFlowStraicoCall', {
      message: prompt,
      models: model
    });

    if (!response.data) throw new Error("Empty response from API.");
    return response.data;
  } catch (error) {
    throw new Error(`Error calling LLM API: ${error.message}`);
  }
}

// ✅ Generates output file
function generateOutputFile(outputText) {
  const filePath = path.join('/tmp', 'final_output.txt');
  fs.writeFileSync(filePath, outputText, 'utf8');
  return filePath;
}

// ✅ Sends a message to Slack
async function sendSlackMessage(channelId, message, filePath) {
  console.log(`📩 Sending message to Slack (${channelId})`);
  const slackToken = process.env.SLACK_BOT_TOKEN;

  const payload = { channel: channelId, text: message };
  await axios.post('https://slack.com/api/chat.postMessage', payload, {
    headers: { 'Authorization': `Bearer ${slackToken}`, 'Content-Type': 'application/json' }
  });

  console.log("✅ Message sent to Slack.");
}

module.exports = executeLLMFlow;
