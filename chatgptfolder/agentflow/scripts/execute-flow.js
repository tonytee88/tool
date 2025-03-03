const fs = require('fs');
const path = require('path');
const axios = require('axios');

const channelId = process.env.SLACK_CHANNEL_ID || "x"; // Capture dynamically
const flowId = process.env.FLOW_ID || "y";

async function executeLLMFlow(flowData, requestType, executionId) {
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
    
    console.log("🔄 Using this executionId in execute-flowjs:", executionId); 

    const executionOrder = determineExecutionOrder(structuredFlow);
    const storedResponses = {}; 
  
    for (const nodeId of executionOrder) {
      const currentNode = structuredFlow[nodeId];
  
      if (!currentNode) continue;
  
      if (currentNode.name === 'LLM Call') {
        console.log(`🚀 Processing LLM Call Node: ${nodeId}`);
  
        if (storedResponses[nodeId]) {
          currentNode.data.output = storedResponses[nodeId];
        } else {
          await waitForInputs(nodeId, structuredFlow);
  
          const combinedInputs = getSortedInputs(nodeId, structuredFlow)
          console.log("📝 Combined Inputs:", combinedInputs.substring(0, 20) + "...");
  
          const selectedModel = currentNode.data.selectedModel || 'openai/gpt-4o-mini';
          //console.log(`📝 Model selected for Node ${nodeId}: ${selectedModel}`);
  
          try {
            const response = await callLLMAPI(combinedInputs, selectedModel);
            const messageResponse = response.data?.completions?.[selectedModel]?.completion?.choices?.[0]?.message?.content || "⚠️ No valid response";
  
            console.log(`✅ LLM Call Node (${nodeId}) works`);
  
            currentNode.data.output = messageResponse;
            storedResponses[nodeId] = messageResponse;

            // 🌟 **Find the correct Output Node ID**
            // Find all connected output nodes
            const outputNodeIds = findConnectedOutputNodes(nodeId, structuredFlow);
            console.log(`🔗 Found ${outputNodeIds.length} output nodes connected to LLM Node ${nodeId}`);

            // Save response for each connected output node
            if (requestType === "browser") {
              // Store for the LLM node itself
              await saveExecutionResponse(executionId, nodeId, messageResponse);
              
              // Store for each connected output node
              for (const outputId of outputNodeIds) {
                console.log(`📤 Storing response for Output Node ${outputId}`);
                await saveExecutionResponse(executionId, outputId, messageResponse);
              }
            }
            updateOutputNodes(structuredFlow, nodeId, messageResponse);

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
        } else {
          console.warn(`⚠️ Output Node (${nodeId}) has no valid LLM input.`);
        }
      }
    }
  
// ✅ Compile final output from all output nodes
const finalOutput = compileFinalOutputs(structuredFlow);

console.log(`🔄 Final output compiled, length: ${finalOutput.length}`);

// Check if Slack notification is required
if (requestType !== "browser" || requestType.excludes("browser")) {
  if (!channelId) {
    console.error("❌ No Slack channel ID provided in environment variables");
  } else if (!finalOutput || finalOutput.trim() === "") {
    console.error("❌ No output to send to Slack");
    // Send a fallback message instead of nothing
    await sendSlackMessage(channelId, "⚠️ The flow execution completed but produced no output.");
  } else {
    console.log(`🚀 Sending output to Slack channel: ${channelId}`);
    await sendSlackMessage(channelId, finalOutput);
  }
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
function areInputsReady(nodeId, structuredFlow) {
  // ✅ Extract correct structure
  //const structuredFlow = flowData[0]?.flowData?.drawflow?.Home?.data;

  if (!structuredFlow || !structuredFlow[nodeId]) {
    console.error(`❌ Node ${nodeId} is missing in flowData!`);
    return false;
  }

  const node = structuredFlow[nodeId];

  const inputConnections = [
    ...(Object.values(node.inputs?.input_1?.connections || []).map(conn => conn.node)),
    ...(Object.values(node.inputs?.input_2?.connections || []).map(conn => conn.node)),
  ];

  for (const inputNodeId of inputConnections) {
    const inputNode = structuredFlow[inputNodeId];

    if (!inputNode) {
      console.error(`❌ Node ${inputNodeId} is missing in flowData!`);
      return false;
    }

    // ✅ Read directly from the saved flowData, not the UI
    const promptData = inputNode.data?.promptText?.trim() || "";
    const outputData = inputNode.data?.output?.trim() || "";

    console.log(`🔍 Checking inputs for Node ${inputNodeId}:`);
    console.log("✅ Output Data:", outputData.substring(0, 20) + "...");
    console.log("✅ Prompt Data:", promptData.substring(0, 20) + "...");

    if (inputNode.name === "Prompt") {
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
  if (!message || message.trim() === "") {
    console.error("❌ Attempted to send empty message to Slack");
    return { error: "Empty message" };
  }
  
  console.log(`🔄 Preparing to send message to Slack channel: ${channelId}`);
  console.log(`📝 Message length: ${message.length} characters`);
  console.log(`📝 Message preview: ${message.substring(0, 100)}...`);
  
  try {
    // Format the message for Slack
    const formattedMessage = formatTextAsHTML(message);
    
    const slackToken = process.env.SLACK_BOT_TOKEN;

    await axios.post('https://slack.com/api/chat.postMessage', {
      channel: channelId,
      text: formattedMessage
    }, {
      headers: { 'Authorization': `Bearer ${slackToken}`, 'Content-Type': 'application/json' }
    });

    console.log("✅ Message sent to Slack.");
  } catch (error) {
    console.error(`❌ Error sending Slack message: ${error.message}`);
    return { error: error.message };
  }
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

// 🌟 Updated execution order logic to ensure dependencies are followed correctly
function determineExecutionOrder(structuredFlow) {
  if (!structuredFlow) {
      console.error("❌ Invalid flowData format from determineExecutionOrder function!");
      return [];
  }

  const executionOrder = [];
  const processedNodes = new Set();

  function traverseNode(nodeId) {
      const nodeIdStr = String(nodeId); 

      if (processedNodes.has(nodeIdStr)) {
          console.log(`⏭️ Node ${nodeIdStr} already processed.`);
          return; 
      }

      const node = structuredFlow[nodeIdStr];
      if (!node) return;

      console.log(`🔍 Analyzing Node: ${nodeIdStr} (${node.name})`);

      // 🌟 Now processing both input ports (top and left) before execution
      const inputConnections = Object.values(node.inputs || {})
          .flatMap(input => input.connections || [])
          .map(conn => String(conn.node)) 
          .filter(inputNodeId => !processedNodes.has(inputNodeId));

      inputConnections.forEach(traverseNode);

      if (!processedNodes.has(nodeIdStr)) {
          executionOrder.push(nodeIdStr);
          processedNodes.add(nodeIdStr);
      }

      const outputConnections = Object.values(node.outputs || {})
          .flatMap(output => output.connections || [])
          .map(conn => String(conn.node)) 
          .filter(outputNodeId => !processedNodes.has(outputNodeId));

      outputConnections.forEach(traverseNode);
  }

  const llmNodes = Object.values(structuredFlow)
      .filter(node => node.name === 'LLM Call')
      .sort((a, b) => (a.pos_y === b.pos_y ? a.pos_x - b.pos_x : a.pos_y - b.pos_y));

  llmNodes.forEach(llmNode => traverseNode(llmNode.id));

  console.log("✅ Final executionOrder:", executionOrder);
  return executionOrder;
}

  
function getSortedInputs(nodeId, structuredFlow) {
  if (!structuredFlow || !structuredFlow[nodeId]) {
    console.error(`❌ Node ${nodeId} not found in flowData!`);
    return "";
  }

  const node = structuredFlow[nodeId];
  console.log("Processing Node ID:", nodeId);

  const inputConnections = [
    ...(node.inputs?.input_1?.connections || []),
    ...(node.inputs?.input_2?.connections || []),
  ];

  if (inputConnections.length === 0) {
    // ✅ Read from stored flowData instead of the browser DOM
    return node.data?.promptText?.trim() || "";
  }

  // ✅ Gather all connected input nodes and read from `flowData`
  const connectedNodes = inputConnections.map(conn => {
    const connectedNodeId = conn.node;
    const connectedNode = structuredFlow[connectedNodeId];

    if (!connectedNode) {
      console.warn(`⚠️ Connected Node ${connectedNodeId} is missing!`);
      return null;
    }

    let connectedText = "";

    if (connectedNode.name === "Prompt") {
      connectedText = connectedNode.data?.promptText?.trim() || "";
    } else if (connectedNode.name === "Output") {
      connectedText = connectedNode.data?.output?.trim() || "";
    } else if (connectedNode.name === "LLM Call") {
      connectedText = connectedNode.data?.output?.trim() || "";
    }

    return {
      id: connectedNodeId,
      x: connectedNode.pos_x,
      y: connectedNode.pos_y,
      text: connectedText,
    };
  }).filter(Boolean);

  // ✅ Sort inputs left to right, top to bottom
  connectedNodes.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

  // ✅ Combine all inputs into one string
  return connectedNodes.map(node => node.text).join(" and ");
}


function formatTextAsHTML(text) {
if (!text) return ""; // Prevent errors with empty text

// ✅ Preserve line breaks
let formattedText = text.replace(/\n/g, "<br>");

// ✅ Convert markdown-like bold text (**bold**) to HTML <strong>
formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

// ✅ Convert markdown-style headings (### Title) into <h3>
formattedText = formattedText.replace(/### (.*?)<br>/g, "<h3>$1</h3>");

// ✅ Convert horizontal separators (---) into <hr>
formattedText = formattedText.replace(/---/g, "<hr>");

return formattedText;
}

function updateOutputNodes(structuredFlow, nodeId, responseText) {

  if (!structuredFlow || !structuredFlow[nodeId]) {
    console.error(`❌ Node ${nodeId} not found in flowData`);
    return;
  }

  // ✅ Update output in the object-based flowData
  structuredFlow[nodeId].data.output = responseText;

  console.log(`✅ Updated output for Node ${nodeId}`);
}
    
function markNodeAsError(flowData, nodeId, errorMessage) {
if (!flowData[nodeId]) {
    console.error(`❌ Node ${nodeId} not found in flowData`);
    return;
}

// ✅ Store the error message in `flowData`
flowData[nodeId].data.error = errorMessage;

console.warn(`⚠️ Marked Node ${nodeId} as error: ${errorMessage}`);
}
  
function compileFinalOutputs(structuredFlow) {
  const allNodes = structuredFlow;
  let finalOutputText = "";
  const terminalOutputs = [];
  
  console.log("🔍 Starting compileFinalOutputs with", Object.keys(allNodes).length, "nodes");
  
  // Identify all terminal output nodes (output nodes with no outgoing connections)
  Object.values(allNodes).forEach(node => {
    if (node.type === "output" || node.name === "Output") {
      // Check if this is a terminal node (no outgoing connections)
      const hasOutgoingConnections = node.outputs && 
                                    Object.values(node.outputs).some(output => 
                                      output.connections && output.connections.length > 0);
      
      if (!hasOutgoingConnections) {
        console.log(`📌 Terminal Output Node Found: ${node.id}`);
        console.log(`   Data available:`, JSON.stringify(node.data || {}));
        
        // Check different possible locations for the output content
        let outputContent = "";
        if (node.data?.output) {
          outputContent = node.data.output;
        } else if (node.data?.content) {
          outputContent = node.data.content;
        } else if (node.content) {
          outputContent = node.content;
        } else if (node.outputs?.output?.content) {
          outputContent = node.outputs.output.content;
        }
        
        outputContent = (outputContent || "").trim();
        
        if (outputContent) {
          console.log(`✅ Found content in node ${node.id}: ${outputContent.substring(0, 50)}...`);
          terminalOutputs.push({
            id: node.id,
            pos_y: node.pos_y || 0,
            pos_x: node.pos_x || 0,
            content: outputContent
          });
        } else {
          console.warn(`⚠️ Terminal Output Node ${node.id} has no content`);
        }
      }
    }
  });
  
  // Sort terminal outputs by vertical position (top to bottom)
  terminalOutputs.sort((a, b) => {
    if (a.pos_y !== b.pos_y) return a.pos_y - b.pos_y; 
    return a.pos_x - b.pos_x;
  });
  
  // Combine all terminal outputs with clear separators
  finalOutputText = terminalOutputs
    .map(output => output.content)
    .filter(Boolean)
    .join("\n\n---\n\n");
  
  console.log(`📊 Final Output compiled from ${terminalOutputs.length} terminal output nodes`);
  console.log(`📝 Final Output length: ${finalOutputText.length} characters`);
  if (finalOutputText.length > 0) {
    console.log(`📝 Final Output preview: ${finalOutputText.substring(0, 100)}...`);
  } else {
    console.log(`⚠️ Final Output is empty!`);
  }
  
  return finalOutputText;
}  


function generateOutputFile(outputText) {
  
  const filePath = path.join('/tmp', 'final_output.txt');
  fs.writeFileSync(filePath, outputText, 'utf8');
  console.log('✅ Final Output File Created:', filePath);
  return filePath;
}

async function saveExecutionResponse(executionId, nodeId, messageResponse) {
    try {
      await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: "save_response",
          executionId,
          nodeId,
          content: messageResponse,
          timestamp: new Date().toISOString(),
        }),
      });
  
      console.log(`📤 Stored response for Execution ID: ${executionId}, Output ID: ${nodeId}`);
    } catch (error) {
      console.error("❌ Error saving execution response:", error);
    }
  }
  
  function findConnectedOutputNodes(llmNodeId, structuredFlow) {
    const connectedOutputs = [];
    
    for (const nodeId in structuredFlow) {
      const node = structuredFlow[nodeId];
      if (node.name === "Output") {
        const inputConnections = Object.values(node.inputs || {})
          .flatMap(input => input.connections.map(conn => conn.node));
        if (inputConnections.includes(llmNodeId)) {
          connectedOutputs.push(nodeId);
        }
      }
    }
    
    return connectedOutputs;
  }

// ✅ Export functiona
module.exports = executeLLMFlow;
