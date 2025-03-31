const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { injectSlackPrompt } = require('./features/slack-prompt-handler');
const pactoAnalysis = require('./features/pacto_analysis');
const googleDocTool = require('./tools/google_doc_tool');

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

    // Get the Slack prompt from environment variable
    const slackPrompt = process.env.PROMPT_TEXT;
    
    if (slackPrompt) {
        console.log("📨 Received Slack prompt:", slackPrompt.substring(0, 50) + "...");
        
        // Inject Slack prompt into appropriate blocks
        const modifiedFlow = injectSlackPrompt(structuredFlow, slackPrompt);
        
        // Continue with execution using the modified flow
        await executeFlowLogic(modifiedFlow, requestType, executionId);
    } else {
        // Continue with normal execution
        await executeFlowLogic(structuredFlow, requestType, executionId);
    }
}

// Separate the main execution logic
async function executeFlowLogic(structuredFlow, requestType, executionId) {
    const executionOrder = determineExecutionOrder(structuredFlow);
    const storedResponses = {}; 
  
    for (const nodeId of executionOrder) {
      const currentNode = structuredFlow[nodeId];
  
      if (!currentNode) continue;
  
      if (currentNode.name === 'LLM Call') {
        console.log(`🚀 Processing LLM Call Node: ${nodeId}`);
  
        await waitForInputs(nodeId, structuredFlow);
  
        const combinedInputs = getSortedInputs(nodeId, structuredFlow)
        console.log("📝 Combined Inputs:", combinedInputs.substring(0, 20) + "...");
  
        const selectedModel = currentNode.data.selectedModel || 'openai/gpt-4o-mini';
  
        try {
          const response = await callLLMAPI(combinedInputs, selectedModel);
          const messageResponse = response.data?.completions?.[selectedModel]?.completion?.choices?.[0]?.message?.content || "⚠️ No valid response";
  
          console.log(`✅ LLM Call Node (${nodeId}) works`);
  
          currentNode.data.output = messageResponse;
          storedResponses[nodeId] = messageResponse;

          const outputNodeIds = findConnectedOutputNodes(nodeId, structuredFlow);
          console.log(`🔗 Found ${outputNodeIds.length} output nodes connected to LLM Node ${nodeId}`);

          if (requestType === "browser") {
            await saveExecutionResponse(executionId, nodeId, messageResponse);
            
            for (const outputId of outputNodeIds) {
              console.log(`📤 Storing response for Output Node ${outputId}`);
              await saveExecutionResponse(executionId, outputId, messageResponse);
            }
          }
          updateOutputNodes(structuredFlow, nodeId, messageResponse);

        } catch (error) {
          console.error(`❌ LLM Call Node (${nodeId}) Error:`, error);
          markNodeAsError(structuredFlow, nodeId, error.message);
        }
      } else if (currentNode.name === 'Facebook Marketing') {
        console.log(`🔄 Processing Facebook Marketing Node: ${nodeId}`);
        
        // Get accountId from node data or look in previous responses
        let accountId = currentNode.data?.accountId;
        if (!accountId) {
          // Look for accountId in previous LLM or Output responses
          for (const [prevNodeId, response] of Object.entries(storedResponses)) {
            const match = response.match(/accountid:(\w+)/i);
            if (match) {
              accountId = match[1];
              console.log(`📝 Found accountId in previous node ${prevNodeId}: ${accountId}`);
              break;
            }
          }
        }
//
        if (!accountId) {
          console.warn(`⚠️ No accountId found for Facebook Marketing node ${nodeId}`);
          markNodeAsError(structuredFlow, nodeId, "No accountId found");
        } else {
          try {
            // Import the Facebook Marketing API module
            const fbMarketing = require('./features/facebook_marketing.api.js');
            
            // Call the API with audience data included
            const result = await fbMarketing.fetchAndStoreInsights({
              accountId,
              timeframe: currentNode.data?.timeframe || 'last_30d',
              level: currentNode.data?.level || 'campaign',
              executionId,
              includeAudienceData: true // Include audience data in the API call
            });

            console.log(`✅ Facebook Marketing API call successful for node ${nodeId}:`, result);
            
            // Store the result in responses for potential later use
            storedResponses[nodeId] = JSON.stringify(result);
            currentNode.data.output = JSON.stringify(result);
            
            // Save the response if in browser mode
            if (requestType === "browser") {
              await saveExecutionResponse(executionId, nodeId, JSON.stringify(result));
            }
          } catch (error) {
            console.error(`❌ Error processing Facebook Marketing node ${nodeId}:`, error);
            markNodeAsError(structuredFlow, nodeId, error.message);
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
      } else if (currentNode.data.type === "PACTO Analysis Export") {
        console.log(`Executing PACTO Analysis Export node: ${nodeId}`);
        
        // Get parameters from node data or previous responses
        const accountId = currentNode.data.accountId || findValueInPreviousResponses(storedResponses, "accountId");
        const timeframe = currentNode.data.timeframe || "last_30d";
        const campaignId = currentNode.data.campaignId || null;
        
        if (!accountId) {
          console.error("❌ PACTO Analysis Export node requires accountId parameter");
          return {
            success: false,
            error: "Missing required parameter: accountId"
          };
        }
        
        try {
          console.log(`📊 Generating and exporting PACTO analysis for account ${accountId}...`);
          
          // Generate and export the analysis report
          const result = await pactoAnalysis.generateAndExportAnalysisReport(accountId, timeframe, campaignId);
          
          if (result.success) {
            console.log(`✅ PACTO analysis exported to Google Sheets: ${result.spreadsheet_url}`);
            
            // Store the result for use by downstream nodes
            storedResponses[nodeId] = JSON.stringify(result);
            currentNode.data.output = JSON.stringify(result);
            
            // Save the response if in browser mode
            if (requestType === "browser") {
              await saveExecutionResponse(executionId, nodeId, JSON.stringify(result));
            }
          } else {
            console.error(`❌ Failed to export PACTO analysis: ${result.error}`);
            return {
              success: false,
              error: result.error
            };
          }
        } catch (error) {
          console.error("❌ Error in PACTO Analysis Export node:", error);
          return {
            success: false,
            error: error.message
          };
        }
      } else if (currentNode.name === 'Google Doc Export') {
        console.log('📝 Processing Google Doc Export node...');
        
        // Get content from connected nodes
        const inputContent = getNodeInputContent(nodeId, structuredFlow);
        
        if (!inputContent) {
          console.warn('⚠️ No valid content found for Google Doc Export node');
          if (requestType === "browser") {
            saveResponse(nodeId, "No content to export");
          }
          return;
        }
        
        // Generate a default title
        const title = `Document ${new Date().toISOString().split('T')[0]}`;
        
        try {
          // Call the Google Doc tool
          const result = await googleDocTool({
            content: inputContent,
            title: title,
            platform: requestType
          });
          
          if (result.success) {
            console.log('✅ Google Doc created:', result.link);
            
            // Store the response
            storedResponses[nodeId] = result.response;
            
            // Save the link to the node's data
            if (structuredFlow[nodeId]) {
              structuredFlow[nodeId].data = {
                ...structuredFlow[nodeId].data,
                link: result.link
              };
            }
            
            // Save response for browser
            if (requestType === "browser") {
              saveResponse(nodeId, result.response);
            }
            
            // Connect to any output nodes that might need the Google Doc response
            const outputNodes = findConnectedOutputNodes(nodeId, structuredFlow);
            for (const outputNodeId of outputNodes) {
              if (outputNodeId !== nodeId) {
                await executeFlowLogic(outputNodeId, structuredFlow, requestType);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error creating Google Doc:', error);
          if (requestType === "browser") {
            saveResponse(nodeId, `Error creating Google Doc: ${error.message}`);
          }
        }
      }
    }
  
// ✅ Compile final output from all output nodes
const finalOutput = compileFinalOutputs(structuredFlow);

console.log(`🔄 Final output compiled, length: ${finalOutput.length}`);

// Check if Slack notification is required
if (requestType !== "browser") {
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

const formattedMessage = message
  .replace(/<\/?br>/g, '\n') // Convert <br> to newlines
  .replace(/<\/?h3>/g, "\n\n") // Ensure double line break after headings
  .replace(/<hr>/g, "\n――――――――――\n") // Convert <hr> to a clean separator
  .replace(/<ul>|<\/ul>/g, "") // Remove <ul> tags
  .replace(/<li>/g, "\n- ") // Convert <li> to bullet points
  .replace(/<\/li>/g, "") // Remove </li>
  .replace(/<\/?strong>/g, "") // Remove strong (no bolding needed)
  .replace(/<\/?[^>]+(>|$)/g, "") // Remove any other HTML tags
  .replace(/\n\s*\n\s*\n/g, "\n\n"); // Prevent excessive blank lines
  
  console.log(`🔄 Preparing to send message to Slack channel: ${channelId}`);
  console.log(`📝 Message length: ${formattedMessage.length} characters`);
  console.log(`📝 Message preview: ${formattedMessage.substring(0, 100)}...`);
  
  try {
    // Format the message for Slack
    //const formattedMessage = formatTextAsHTML(message);
    
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

    // Process input dependencies first
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

  // First process LLM nodes
  const llmNodes = Object.values(structuredFlow)
    .filter(node => node.name === 'LLM Call')
    .sort((a, b) => (a.pos_y === b.pos_y ? a.pos_x - b.pos_x : a.pos_y - b.pos_y));

  llmNodes.forEach(llmNode => traverseNode(llmNode.id));

  // Then process Facebook Marketing nodes that haven't been processed yet
  const fbNodes = Object.values(structuredFlow)
    .filter(node => 
      node.name === 'Facebook Marketing' && 
      !processedNodes.has(String(node.id))
    );

  fbNodes.forEach(fbNode => traverseNode(fbNode.id));

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

  // Store the error message in `flowData`
  flowData[nodeId].data.output = `Error: ${errorMessage}`;
  flowData[nodeId].data.error = true;
  console.log(`❗ Marked Node ${nodeId} with error: ${errorMessage}`);
}

// ✅ Find Output nodes connected to a source node
function findConnectedOutputNodes(sourceNodeId, structuredFlow) {
  const outputNodes = [];
  
  for (const nodeId in structuredFlow) {
    const node = structuredFlow[nodeId];
    
    if (node.name === 'Output' || node.name === 'Google Doc Export') {
      // Check if this Output node is connected to our source node
      const inputConnections = node.inputs?.input_1?.connections || [];
      
      for (const connection of inputConnections) {
        if (connection.node === sourceNodeId) {
          outputNodes.push(nodeId);
          console.log(`🔗 Found connected ${node.name} node: ${nodeId}`);
          break;
        }
      }
    }
  }
  
  console.log(`📊 Total connected output nodes found: ${outputNodes.length}`);
  return outputNodes;
}

// ✅ Compile all outputs for return value
function compileFinalOutputs(structuredFlow) {
  let finalOutput = "";
  
  // Gather all output nodes and Google Doc nodes
  const outputNodes = Object.entries(structuredFlow)
    .filter(([_, node]) => node.name === 'Output' || node.name === 'Google Doc Export')
    .map(([id, node]) => ({
      id,
      output: node.data?.output || "",
      pos_y: node.pos_y,
      pos_x: node.pos_x
    }));
  
  // Sort output nodes top to bottom, left to right
  outputNodes.sort((a, b) => a.pos_y === b.pos_y ? a.pos_x - b.pos_x : a.pos_y - b.pos_y);
  
  // Concatenate all outputs
  finalOutput = outputNodes.map(node => node.output).join("\n\n");
  
  return finalOutput;
}

// ✅ Store response data in MongoDB
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

// Find value in previous node responses
function findValueInPreviousResponses(storedResponses, key) {
  for (const response of Object.values(storedResponses)) {
    try {
      const parsed = JSON.parse(response);
      if (parsed[key]) {
        return parsed[key];
      }
    } catch (e) {
      // Not a JSON response, continue to next
      continue;
    }
  }
  return null;
}

function getTotalResponseCount() {
  const flowData = editor.export();
  const nodeEntries = Object.entries(flowData.drawflow.Home.data);
  const llmNodes = nodeEntries.filter(([_, node]) => node.name === "LLM Call");
  const outputNodes = nodeEntries.filter(([_, node]) => node.name === "Output");
  const googleDocNodes = nodeEntries.filter(([_, node]) => node.name === "Google Doc Export");
  
  console.log("📊 Counting nodes:", {
    llmNodes: llmNodes.length,
    outputNodes: outputNodes.length,
    googleDocNodes: googleDocNodes.length
  });
  
  // Count the total responses we expect (all LLM nodes, Output nodes, and Google Doc nodes)
  return llmNodes.length + outputNodes.length + googleDocNodes.length;
}

// ✅ Get input content from connected nodes
function getNodeInputContent(nodeId, structuredFlow) {
  if (!structuredFlow || !structuredFlow[nodeId]) {
    console.error(`❌ Node ${nodeId} not found in flowData`);
    return null;
  }

  const node = structuredFlow[nodeId];
  const inputConnections = node.inputs?.input_1?.connections || [];

  if (inputConnections.length === 0) {
    console.warn(`⚠️ No input connections found for node ${nodeId}`);
    return null;
  }

  // Get content from the connected node
  const connectedNodeId = inputConnections[0].node;
  const connectedNode = structuredFlow[connectedNodeId];

  if (!connectedNode) {
    console.error(`❌ Connected node ${connectedNodeId} not found`);
    return null;
  }

  // Get content based on node type
  let content = null;
  if (connectedNode.name === "LLM Call") {
    content = connectedNode.data?.output;
  } else if (connectedNode.name === "Output") {
    content = connectedNode.data?.output;
  } else if (connectedNode.name === "Prompt") {
    content = connectedNode.data?.promptText;
  }

  if (!content) {
    console.warn(`⚠️ No content found in connected node ${connectedNodeId}`);
    return null;
  }

  console.log(`✅ Retrieved content from node ${connectedNodeId}`);
  return content;
}

module.exports = executeLLMFlow;