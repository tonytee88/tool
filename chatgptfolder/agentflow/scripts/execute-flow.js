const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function executeLLMFlow(flowData, slackResponseUrl) {
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
    await sendOutputToSlack(slackResponseUrl, filePath);
  }
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
  
  function generateOutputFile(outputText) {
    const filePath = path.join('/tmp', 'final_output.txt');
    fs.writeFileSync(filePath, outputText, 'utf8');
    console.log('✅ Final Output File Created:', filePath);
    return filePath;
  }
  
  async function sendOutputToSlack(responseUrl, filePath) {
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
  
      await axios.post(responseUrl, {
        response_type: 'in_channel',
        text: '✅ Here is the final compiled output:',
        attachments: [
          {
            title: 'final_output.txt',
            text: fileData
          }
        ]
      });
  
      console.log("✅ Final output sent to Slack.");
    } catch (error) {
      console.error("❌ Error sending output to Slack:", error);
    }
  }
  