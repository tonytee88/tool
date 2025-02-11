const fs = require('fs');
const path = require('path');
const axios = require('axios');

let flowData = [{"_id":"6797f26c3d093dbffdecd779","flowId":"New Flow 01","flowData":{"drawflow":{"Home":{"data":{"1":{"id":1,"name":"LLM Call","data":{"selectedModel":"openai/gpt-4o-mini"},"class":"llm","html":"<div class=\"df-node-content block-llm\">\n        <strong>LLM Call</strong>\n        <div>\n          <label for=\"model-dropdown\" style=\"display: block; margin-bottom: 5px;\">Select Model</label>\n          <select class=\"model-dropdown\" data-dashlane-rid=\"826e8d5abca6b070\" data-dashlane-classification=\"other\">\n            <option value=\"openai/gpt-4o-mini\">GPT-4o-mini</option>\n            <option value=\"anthropic/claude-3.5-sonnet\">Claude 3.5 Sonnet</option>\n            <option value=\"perplexity/llama-3.1-sonar-large-128k-online\">Perplexity</option>\n          </select>\n        </div>\n      </div>","typenode":false,"inputs":{"input_1":{"connections":[{"node":"3","input":"output_1"}]}},"outputs":{"output_1":{"connections":[{"node":"2","output":"input_1"}]}},"pos_x":237,"pos_y":156},"2":{"id":2,"name":"Output","data":{},"class":"output","html":"<div class=\"df-node-content block-output\" style=\"width: 400px; max-width: 400px;\">\n        <strong>Output</strong>\n        <div class=\"output-response\" style=\"\n          max-height: 200px; \n          overflow-y: auto; \n          background: #1e1e1e; \n          color: white; \n          padding: 10px; \n          border-radius: 5px; \n          font-size: 14px;\n          width: 100%;\n        \"></div>\n        <button class=\"copy-output-btn\" style=\"\n          margin-top: 10px; \n          cursor: pointer;\n          display: block; \n          width: 100px;\n        \" data-dashlane-label=\"true\" data-dashlane-rid=\"c24c61304a4986cf\" data-dashlane-classification=\"other\">Copy</button>\n      </div>","typenode":false,"inputs":{"input_1":{"connections":[{"node":"1","input":"output_1"}]}},"outputs":{"output_1":{"connections":[]}},"pos_x":567,"pos_y":222},"3":{"id":3,"name":"Prompt","data":{"name":"Prompt Name","promptText":"Prompt Text"},"class":"prompt","html":"<div class=\"df-node-content block-prompt\">\n        <div class=\"prompt-name-display\" style=\"color: white; font-size: 14px; font-weight: bold;\">Prompt Name</div>\n        <div class=\"prompt-text-display\" style=\"color: white; font-size: 12px; margin-top: 5px;\">hello</div>\n        <button class=\"prompt-edit-btn\" style=\"margin-top: 10px;\" data-dashlane-label=\"true\" data-dashlane-rid=\"37d0e683c28c2916\" data-dashlane-classification=\"other\">Edit</button>\n      </div>","typenode":false,"inputs":{"input_1":{"connections":[]}},"outputs":{"output_1":{"connections":[{"node":"1","output":"input_1"}]}},"pos_x":35,"pos_y":81}}}}},"metadata":{"name":"New Flow 01","updatedAt":"2025-02-11T14:46:02.617Z"},"updatedAt":"2025-02-11T14:46:02.813Z"}]

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

  executeLLMFlow(flowData, slackResponseUrl);