const fs = require('fs');
const path = require('path');
const axios = require('axios');
const channelId = process.env.SLACK_CHANNEL_ID || "x" ; // 🔹 Capture dynamically
let flowData = [{"_id":"6797f26c3d093dbffdecd779","flowId":"New Flow 01","flowData":{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"LLM Call","data":{"selectedModel":"openai/gpt-4o-mini"},"class":"llm","html":"<div class=\"df-node-content block-llm\">\n        <strong>LLM Call</strong>\n        <div>\n          <label for=\"model-dropdown\" style=\"display: block; margin-bottom: 5px;\">Select Model</label>\n          <select class=\"model-dropdown\" data-dashlane-rid=\"826e8d5abca6b070\" data-dashlane-classification=\"other\">\n            <option value=\"openai/gpt-4o-mini\">GPT-4o-mini</option>\n            <option value=\"anthropic/claude-3.5-sonnet\">Claude 3.5 Sonnet</option>\n            <option value=\"perplexity/llama-3.1-sonar-large-128k-online\">Perplexity</option>\n          </select>\n        </div>\n      </div>","typenode":false,"inputs":{"input_1":{"connections":[{"node":"3","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":237,"pos_y":156},"2":{"id":2,"name":"Output","data":{},"class":"output","html":"<div class=\"df-node-content block-output\" style=\"width: 400px; max-width: 400px;\">\n        <strong>Output</strong>\n        <div class=\"output-response\" style=\"\n          max-height: 200px; \n          overflow-y: auto; \n          background: #1e1e1e; \n          color: white; \n          padding: 10px; \n          border-radius: 5px; \n          font-size: 14px;\n          width: 100%;\n        \"></div>\n        <button class=\"copy-output-btn\" style=\"\n          margin-top: 10px; \n          cursor: pointer;\n          display: block; \n          width: 100px;\n        \" data-dashlane-label=\"true\" data-dashlane-rid=\"c24c61304a4986cf\" data-dashlane-classification=\"other\">Copy</button>\n      </div>","typenode":false,"inputs":{"input_1":{"connections":[{"node":"1","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":567,"pos_y":222},"3":{"id":3,"name":"Prompt","data":{"name":"Prompt Name","promptText":"Prompt Text"},"class":"prompt","html":"<div class=\"df-node-content block-prompt\">\n        <div class=\"prompt-name-display\" style=\"color: white; font-size: 14px; font-weight: bold;\">Prompt Name</div>\n        <div class=\"prompt-text-display\" style=\"color: white; font-size: 12px; margin-top: 5px;\">hello</div>\n        <button class=\"prompt-edit-btn\" style=\"margin-top: 10px;\" data-dashlane-label=\"true\" data-dashlane-rid=\"37d0e683c28c2916\" data-dashlane-classification=\"other\">Edit</button>\n      </div>","typenode":false,"inputs":{"input_1":{"connections":[]}},"outputs":{"output_1":{"connections":[{"node":"1","output":"input_1"}]}},"pos_x":35,"pos_y":81}}}}},"metadata":{"name":"New Flow 01","updatedAt":"2025-02-11T14:46:02.617Z"},"updatedAt":"2025-02-11T14:46:02.813Z"}]

async function executeLLMFlow(flowData) {
  const executionOrder = determineExecutionOrder(flowData);
  const storedResponses = {}; // ✅ Cache responses to avoid redundant API calls
  const executionQueue = [...executionOrder]; // ✅ Queue-based execution

  while (executionQueue.length > 0) {
    const nodeId = executionQueue.shift(); // ✅ Get the next node to process
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
        console.log("📝 combinedInputs: " + combinedInputs);

        const nodeElement = document.getElementById(`node-${nodeId}`);
        const modelDropdown = nodeElement?.querySelector('.model-dropdown');
        const selectedModel = modelDropdown?.value || currentNode.data.selectedModel || 'openai/gpt-4o-mini';

        currentNode.data.selectedModel = selectedModel;
        console.log(`📝 Model selected for Node ${nodeId}: ${selectedModel}`);

        try {
          const response = await callLLMAPI(combinedInputs, selectedModel);
          const messageResponse = response.data.completions[selectedModel].completion.choices[0].message.content;

          console.log(`✅ LLM Call Node (${nodeId}) Response: ${messageResponse}`);

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

  // ✅ After execution, find all final Output Nodes and compile results
  const finalOutputText = compileFinalOutputs(flowData);
  
  if (finalOutputText) {
    const filePath = generateOutputFile(finalOutputText);
    await sendSlackMessage(channelId, "here's the output", filePath);
  }

  async function waitForInputs(nodeId, flowData) {
    return new Promise(resolve => {
      const checkInputs = () => {
        if (areInputsReady(nodeId, flowData)) {
          console.log(`✅ Inputs for Node ${nodeId} are now ready!`);
          resolve(); // Continue execution
        } else {
          console.log(`⏳ Waiting for inputs for Node ${nodeId}...`);
          setTimeout(checkInputs, 2000); // Recheck every 2 seconds
        }
      };
  
      checkInputs(); // Initial check
    });
  }
  
  function enqueueConnectedNodes(nodeId, flowData, queue) {
    const currentNode = flowData.drawflow.Home.data[nodeId];
    if (!currentNode) return;
  
    const outputConnections = Object.values(currentNode.outputs)
      .flatMap(output => output.connections)
      .map(conn => conn.node);
  
    outputConnections.forEach(nextNodeId => {
      if (!queue.includes(nextNodeId)) {
        queue.push(nextNodeId); // ✅ Add only if not already in queue
      }
    });
  }
  
  function compileFinalOutputs(flowData) {
    const allNodes = flowData.drawflow.Home.data;
    let finalOutputText = "";
  
    Object.values(allNodes).forEach(node => {
      if (node.name === "Output" && node.outputs.output_1.connections.length === 0) {
        console.log(`📌 Final Output Node Detected: ${node.id}`);
        finalOutputText += `${node.data.output || "No output generated"}\n\n`;
      }
    });
  
    return finalOutputText.trim();
  }
  
  function determineExecutionOrder(flowData) {
    const allNodes = flowData.drawflow.Home.data;
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

  function generateOutputFile(outputText) {
    const filePath = path.join('/tmp', 'final_output.txt');
    fs.writeFileSync(filePath, outputText, 'utf8');
    console.log('✅ Final Output File Created:', filePath);
    return filePath;
  }
  
// ✅ Sends a message to Slack (to correct channel)
async function sendSlackMessage(channelId, message, filePath = null) {
  try {
    console.log(`📩 Sending message to Slack Channel (${channelId}): "${message}"`);

    const slackToken = process.env.SLACK_BOT_TOKEN;

    const payload = {
      channel: channelId,
      text: message,
    };

    const response = await axios.post('https://slack.com/api/chat.postMessage', payload, {
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.data.ok) {
      console.error(`❌ Slack message failed:`, response.data);
      throw new Error(`Slack message failed: ${response.data.error}`);
    }

    console.log(`✅ Message successfully sent to Slack.`);
  } catch (error) {
    console.error('❌ Error sending message to Slack:', error);
  }
}

function getSortedInputs(nodeId, flowData) {
    const node = flowData.drawflow.Home.data[nodeId];
    console.log("Processing Node ID:", nodeId);
  
    const inputConnections = node.inputs.input_1.connections || [];
  
    if (inputConnections.length === 0) {
      const currentNodeElement = document.getElementById(`node-${nodeId}`);
      const currentPromptTextElement = currentNodeElement?.querySelector('.prompt-text-display');
      return currentPromptTextElement ? currentPromptTextElement.textContent.trim() : '';
    }
  
    // Gather all connected input nodes
    const connectedNodes = inputConnections.map(conn => {
      const connectedNodeId = conn.node;
      const connectedNode = flowData.drawflow.Home.data[connectedNodeId];
  
      if (!connectedNode) return null;
  
      const connectedNodeElement = document.getElementById(`node-${connectedNodeId}`);
      let connectedText = '';
  
      if (connectedNode.name === 'Prompt' || connectedNode.name === 'Output') {
        const promptTextElement = connectedNodeElement?.querySelector('.prompt-text-display') ||
                                  connectedNodeElement?.querySelector('.output-response');
        connectedText = promptTextElement ? promptTextElement.textContent.trim() : '';
      } else if (connectedNode.name === 'LLM Call') {
        connectedText = connectedNode.data.output || ''; // Use stored LLM response if available
        updateFlowData();
      }
  
      return {
        id: connectedNodeId,
        x: connectedNode.pos_x,
        y: connectedNode.pos_y,
        text: connectedText,
      };
    }).filter(Boolean);
  
    // Sort inputs left to right, top to bottom
    connectedNodes.sort((a, b) => a.y === b.y ? a.x - b.x : a.y - b.y);
  
    // Combine all inputs into one string
    return connectedNodes.map(node => node.text).join(' and ');
  }

  function updateOutputNodes(flowData, nodeId, responseText) {
    const nodeElement = document.getElementById(`node-${nodeId}`);
  
    if (nodeElement) {
      const outputDiv = nodeElement.querySelector('.output-response');
      if (outputDiv) {
        outputDiv.innerHTML = formatTextAsHTML(responseText); // ✅ Apply structured formatting
      }
    }
  
    // ✅ Also update the stored flow data
    flowData.drawflow.Home.data[nodeId].data.output = responseText;
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

  function markNodeAsError(nodeId, errorMessage) {
    const nodeElement = document.getElementById(`node-${nodeId}`);
      if (!nodeElement) return;
    
      // Add error indicator
      const errorIndicator = document.createElement('div');
      errorIndicator.className = 'error-indicator';
      errorIndicator.title = errorMessage; // Tooltip with the error message
      errorIndicator.innerHTML = '⚠️'; // Warning icon
      nodeElement.appendChild(errorIndicator);
    }

    async function callLLMAPI(prompt, model) {
        console.log(model);
        try {
          const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowStraicoCall', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: prompt, models: model }),
          });
      
          if (!response.ok) {
            throw new Error(`Failed to call LLM API: ${response.statusText}`);
          }
      
          return await response.json();
        } catch (error) {
          throw new Error(`Error calling LLM API: ${error.message}`);
        }
      }

}



  executeLLMFlow(flowData);