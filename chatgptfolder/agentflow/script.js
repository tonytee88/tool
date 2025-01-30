// Initialize Drawflow
const editor = new Drawflow(document.getElementById("drawflow"));
editor.start();
editor.editor_mode = "edit";

// Track which node is being edited in the modal
let currentEditNodeId = null;
let currentZoom = 1; 

// Get the modal elements
const modalOverlay = document.getElementById('modal-overlay');
const promptModal = document.getElementById('prompt-modal');
const promptModalNameInput = document.querySelector('#prompt-modal .prompt-modal-name');
const promptModalTextarea = document.querySelector('#prompt-modal .prompt-modal-textarea');

// BIND THE TOOLBAR BUTTONS
document.getElementById('btn-add-start').addEventListener('click', () => addNode('start'));
document.getElementById('btn-add-prompt').addEventListener('click', () => createPromptNode(100, 100));
document.getElementById('btn-add-llm').addEventListener('click', () => addNode('llm'));
document.getElementById('btn-add-output').addEventListener('click', () => addNode('output'));
document.getElementById('btn-save').addEventListener('click', saveFlow);
document.getElementById('btn-load').addEventListener('click', openLoadFlowModal);
document.getElementById('load-confirm').addEventListener('click', loadSelectedFlow);
document.getElementById('load-cancel').addEventListener('click', closeLoadFlowModal);
document.getElementById('btn-start-flow').addEventListener('click', startFlowExecution);

// BIND THE MODAL EVENTS
const modalSaveButton = document.querySelector('#prompt-modal button[onclick^="closePromptModal(true)"]');
const modalCancelButton = document.querySelector('#prompt-modal button[onclick^="closePromptModal(false)"]');

modalSaveButton.addEventListener('click', () => closePromptModal(true));
modalCancelButton.addEventListener('click', () => closePromptModal(false));
modalOverlay.addEventListener('click', () => closePromptModal(false));

//zoom
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  if (currentZoom < 2) { // Limit max zoom to 2x
    currentZoom += 0.1;
    editor.zoom_in(currentZoom);
  }
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  if (currentZoom > 0.2) { // Prevent zooming out too much
    currentZoom -= 0.1;
    editor.zoom_out(currentZoom);
  }
});

document.getElementById('btn-reset-zoom').addEventListener('click', () => {
  currentZoom = 1;
  editor.zoom_reset(currentZoom);
});

// Add a node of given type
function addNode(type) {
  const { x, y } = editor.mouse_position || { x: 100, y: 100 };
  switch (type) {
    case 'start': createStartNode(x, y); break;
    case 'prompt': createPromptNode(x, y); break;
    case 'llm': createLLMNode(x, y); break;
    case 'output': createOutputNode(x, y); break;
    default: console.error("Unknown node type:", type);
  }
}
function updateFlowData() {
  // Export the current flow data to get the list of nodes
  const flowData = editor.export();
  const nodes = Object.entries(flowData.drawflow.Home.data); // Array of node entries

  // Loop through the nodes in the current flow on display
  nodes.forEach(([nodeId]) => {
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      // Extract the required HTML without duplicate wrappers
      const updatedHtml = extractContentNodeHtml(nodeElement);

      // Update Drawflow's internal data structure
      editor.drawflow.drawflow.Home.data[nodeId].html = updatedHtml; // **Fix: Only insert cleaned content**
    }
  });
}

async function saveFlow() {
  const flowName = document.getElementById('flow-name').value.trim() || 'New Flow 01';
  updateFlowData();
  // Re-export the flow to include the updated HTML
  const updatedFlowData = editor.export();

  // Call the MongoDB API to save the updated flow
  try {
    const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        flowId: flowName,
        flowData: updatedFlowData,
        metadata: {
          name: flowName,
          updatedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save flow');
    }

    const result = await response.json();
    console.log("Flow saved")
  } catch (error) {
    console.error('Error saving flow:', error);
    alert('Failed to save flow');
  }
}

function extractContentNodeHtml(nodeElement) {
  // Clone the node to avoid modifying the original
  const clonedNode = nodeElement.cloneNode(true);

  // Remove the "inputs" and "outputs" divs (Drawflow will auto-generate these)
  clonedNode.querySelectorAll('.inputs, .outputs').forEach(el => el.remove());

  // Get the inner HTML of "drawflow_content_node" without extra wrappers
  const contentNode = clonedNode.querySelector('.drawflow_content_node');
  return contentNode ? contentNode.innerHTML.trim() : '';
}

// New function to open load flow modal and populate flow list
async function openLoadFlowModal() {
  try {
    const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve flows');
    }

    const flows = await response.json();
    
    // Populate the dropdown
    const flowList = document.getElementById('flow-list');
    flowList.innerHTML = ''; // Clear existing options
    
    flows.forEach(flow => {
      const option = document.createElement('option');
      option.value = flow.flowId;
      option.textContent = flow.metadata?.name || flow.flowId;
      flowList.appendChild(option);
    });

    // Show the modal
    document.getElementById('load-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
  } catch (error) {
    console.error('Error listing flows:', error);
    alert('Failed to load flows');
  }
}
  
// Function to close the load flow modal
function closeLoadFlowModal() {
  document.getElementById('load-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
}

function toDrawflowFormat(apiResponse) {
  //console.log('Raw API Response:', apiResponse);

  // Check if we have valid data
  if (!Array.isArray(apiResponse) || apiResponse.length === 0 || !apiResponse[0]?.flowData?.drawflow?.Home?.data) {
      console.error('Data structure is not as expected');
      return createDefaultFlow();
  }

  // Extract the drawflow data
  const drawflowData = apiResponse[0].flowData;
  //console.log('Extracted Drawflow Data:', drawflowData);

  // If the data object is empty, return a default flow
  if (Object.keys(drawflowData.drawflow.Home.data).length === 0) {
      console.log('Flow data is empty, creating default flow');
      return createDefaultFlow();
  }

  return drawflowData;
}

async function loadSelectedFlow() {
  try {
    const flowList = document.getElementById('flow-list');
    const selectedFlowId = flowList.value;

    if (!selectedFlowId) {
      alert('Please select a flow to load');
      return;
    }

    const flowNameInput = document.getElementById('flow-name');
    flowNameInput.value = selectedFlowId;

    const response = await fetch(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${selectedFlowId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();

    if (!apiResponse) {
      throw new Error('Empty response from API');
    }

    const drawflowData = toDrawflowFormat(apiResponse);

    // Clear existing nodes before importing
    editor.clear();

    // Import the flow
    editor.import(drawflowData);

    // Re-import the export to ensure everything is synchronized
    //editor.import(editor.export());

    // Reattach listeners for all nodes
    reattachAllListeners();

    // Close the modal
    closeLoadFlowModal();
  } catch (error) {
    console.error('Error loading flow:', error);
    alert(`Failed to load flow: ${error.message}`);
  }
}


// --- START NODE ---
function createStartNode(x, y) {
  editor.addNode(
    'Start',  // label
    0,        // inputs
    1,        // outputs
    x,
    y,
    'start',  // CSS class
    {},
    `<div class="df-node-content block-start"><strong>Start Block</strong></div>`
  );
}

// --- PROMPT NODE ---
function createPromptNode(x, y) {
  const nodeId = editor.addNode(
    'Prompt',
    1, // inputs
    1, // outputs
    x,
    y,
    'prompt', // CSS class/type
    { name: 'Prompt Name', promptText: 'Prompt Text' }, // Default data
    `
      <div class="df-node-content block-prompt">
        <div class="prompt-name-display" style="color: white; font-size: 14px; font-weight: bold;">Prompt Name</div>
        <div class="prompt-text-display" style="color: white; font-size: 12px; margin-top: 5px;">Prompt Text</div>
        <button class="prompt-edit-btn" style="margin-top: 10px;">Edit</button>
      </div>
    `
  );

  // Attach listeners after the node is created
  setTimeout(() => attachPromptListeners(nodeId), 0);
}

// Attach event listeners for the newly created Prompt node
function attachPromptListeners(nodeId) {
  const nodeElement = document.querySelector(`#node-${nodeId} .df-node-content.block-prompt`);
  if (!nodeElement) return;

  const node = editor.getNodeFromId(nodeId);

  // Attach click listener to the Edit button
  const editButton = nodeElement.querySelector('.prompt-edit-btn');
  if (editButton) {
    editButton.onclick = () => openPromptModal(nodeId);
  }
}

function updatePromptContent(value, nodeId, previewDiv) {
  const node = editor.getNodeFromId(nodeId);
  if (node) {
    node.data.promptText = value;
    previewDiv.textContent = value.length > 50 
      ? value.substring(0, 50) + '...'
      : value;
  }
}

function updatePromptName(value, nodeId) {
  const node = editor.getNodeFromId(nodeId);
  if (node) {
    node.data.name = value;
  }
}

// Open the modal for the prompt's big text

function openPromptModal(nodeId) {
  currentEditNodeId = nodeId;
  const nodeElement = document.getElementById(`node-${nodeId}`);
  if (!nodeElement) return;

  // Get modal input elements
  const promptModalNameInput = document.getElementById('prompt-modal-name');
  const promptModalTextarea = document.getElementById('prompt-modal-textarea');

  // Get text from the correct node block
  const promptNameDiv = nodeElement.querySelector('.prompt-name-display');
  const promptTextDiv = nodeElement.querySelector('.prompt-text-display');

  // Assign values correctly
  promptModalNameInput.value = promptNameDiv ? promptNameDiv.textContent.trim() : '';
  promptModalTextarea.value = promptTextDiv ? promptTextDiv.textContent.trim() : '';

  // Show the modal and overlay
  document.getElementById('modal-overlay').style.display = 'block';
  document.getElementById('prompt-modal').style.display = 'block';
}

function closePromptModal(doSave) {
  if (currentEditNodeId !== null && doSave) {
    const node = editor.getNodeFromId(currentEditNodeId);
    if (node) {
      const promptModalNameInput = document.getElementById('prompt-modal-name');
      const promptModalTextarea = document.getElementById('prompt-modal-textarea');

      // Save full input and name to the node
      node.data.name = promptModalNameInput.value;
      node.data.promptText = promptModalTextarea.value;

      // Update the node display with capped text
      const nodeElement = document.querySelector(`#node-${currentEditNodeId} .df-node-content.block-prompt`);
      const nameDisplay = nodeElement.querySelector('.prompt-name-display');
      const textDisplay = nodeElement.querySelector('.prompt-text-display');

      nameDisplay.textContent = node.data.name;
      textDisplay.textContent =
        node.data.promptText.length > 100
          ? node.data.promptText.substring(0, 100) + "..."
          : node.data.promptText;
    }
  }

  // Hide the modal and overlay
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('prompt-modal').style.display = 'none';
  currentEditNodeId = null;
}

// --- LLM NODE ---
function createLLMNode(x, y) {
  editor.addNode(
    'LLM Call',
    1, // One input (for connecting prompt block)
    1, // One output (for connecting output block)
    x,
    y,
    'llm',
    { selectedModel: "openai/gpt-4o-mini" }, // Default selected model
    `
      <div class="df-node-content block-llm">
        <strong>LLM Call</strong>
        <div>
          <label for="model-dropdown" style="display: block; margin-bottom: 5px;">Select Model</label>
          <select class="model-dropdown">
            <option value="openai/gpt-4o-mini">GPT-4o-mini</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="perplexity/llama-3.1-sonar-large-128k-online">Perplexity</option>
          </select>
        </div>
      </div>
    `
  );

  // Attach event listeners to the dropdown and button
  setTimeout(() => attachLLMListeners(editor.drawflow.drawflow.Home.data), 0);
}

function attachLLMListeners() {
  document.querySelectorAll('.model-dropdown').forEach((dropdown) => {
    dropdown.addEventListener('change', (event) => {
      const nodeId = event.target.closest('.drawflow-node').id.split('-')[1];
      const node = editor.getNodeFromId(nodeId);
      node.data.selectedModel = event.target.value; // Update selected model in the node data
    });
  });
}

// --- OUTPUT NODE ---
function createOutputNode(x, y) {
  editor.addNode(
    'Output',
    1, // Inputs
    1, // 1 Output now correctly placed
    x,
    y,
    'output',
    {},
    `
      <div class="df-node-content block-output" style="width: 400px; max-width: 400px;">
        <strong>Output</strong>
        <div class="output-response" style="
          max-height: 200px; 
          overflow-y: auto; 
          background: #1e1e1e; 
          color: white; 
          padding: 10px; 
          border-radius: 5px; 
          font-size: 14px;
          width: 100%;
        "></div>
        <button class="copy-output-btn" style="
          margin-top: 10px; 
          cursor: pointer;
          display: block; 
          width: 100px;
        ">Copy</button>
      </div>
    `
  );
}


function attachOutputListeners(nodeId) {
  setTimeout(() => { // Add slight delay to ensure elements exist
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (!nodeElement) {
      console.error(`Output node ${nodeId} not found for event listener.`);
      return;
    }

    const copyButton = nodeElement.querySelector('.copy-output-btn');
    const outputDiv = nodeElement.querySelector('.output-response');

    if (copyButton && outputDiv) {
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(outputDiv.innerText)
          .then(() => alert('Output copied to clipboard!'))
          .catch(err => console.error('Failed to copy text: ', err));
      });
    }
  }, 200); // Ensure it's executed slightly after rendering
}

// Optional: Add a method to list available flows
async function listFlows() {
  try {
    const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD/list', {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve flows');
    }

    const flows = await response.json();
    // Implement UI to display and select flows
    displayFlowsList(flows);
  } catch (error) {
    console.error('Error listing flows:', error);
  }
}

function reattachAllListeners() {
  // Iterate through all nodes in the flow
  const nodes = editor.drawflow.drawflow.Home.data;
  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    if (node.class === 'prompt') {
      attachPromptListeners(node.id); // Reattach listeners for prompt nodes
    }
  }
}

function updatePromptNodeHtml(nodeId, newHtmlContent) {
  // Select the node's content container in the DOM
  const nodeElement = document.querySelector(`#node-${nodeId} .df-node-content.block-prompt`);
  if (!nodeElement) {
    console.error(`Node with ID ${nodeId} not found in the DOM.`);
    return;
  }

  // Update the node's inner HTML in the DOM
  nodeElement.innerHTML = newHtmlContent;

  // Update the node's internal data in Drawflow
  const node = editor.drawflow.drawflow.Home.data[nodeId];
  if (node) {
    node.html = newHtmlContent; // Synchronize Drawflow's internal data
    console.log(`Node ${nodeId} HTML successfully updated.`);
  } else {
    console.error(`Node with ID ${nodeId} not found in Drawflow data.`);
  }
}


let fullPromptText = ''; // Store the full input

// When saving, ensure the full text is preserved
function closePromptModal(doSave) {
  if (currentEditNodeId !== null && doSave) {
    const node = editor.getNodeFromId(currentEditNodeId);
    if (node) {
      const promptModalNameInput = document.getElementById('prompt-modal-name');
      const promptModalTextarea = document.getElementById('prompt-modal-textarea');

      // Save full input and name to the node
      node.data.name = promptModalNameInput.value;
      node.data.promptText = promptModalTextarea.value; // Store full text

      // Update the node display
      const nodeElement = document.querySelector(`#node-${currentEditNodeId} .df-node-content.block-prompt`);
      const nameDisplay = nodeElement.querySelector('.prompt-name-display');
      const textDisplay = nodeElement.querySelector('.prompt-text-display');

      // Update block displays
      nameDisplay.textContent = node.data.name;
      textDisplay.textContent = node.data.promptText
    }
  }

  // Hide the modal and overlay
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('prompt-modal').style.display = 'none';
  currentEditNodeId = null;
}


// =========================================================================================================
//flow execution
// =========================================================================================================

async function startFlowExecution() {
  await saveFlow(); // Save the flow before execution
  storedResponses = {}; // ✅ Clear stored responses before starting
  clearOutputNodes(); // ✅ Reset the UI for output nodes

  const flowData = editor.export();
  console.log('Starting optimized LLM execution...');
  await executeLLMFlow(flowData);
}

function clearOutputNodes() {
  const flowData = editor.export();
  const allNodes = flowData.drawflow.Home.data;

  Object.values(allNodes).forEach(node => {
    if (node.name === 'Output') {
      node.data.output = "Waiting for response..."; // ✅ Store the placeholder in data
      const nodeElement = document.getElementById(`node-${node.id}`);
      if (nodeElement) {
        const outputDiv = nodeElement.querySelector('.output-response');
        if (outputDiv) {
          outputDiv.innerHTML = "<em>Waiting for response...</em>"; // ✅ UI feedback
        }
      }
    }
  });

  // ✅ Ensure placeholder is cleared upon execution
  setTimeout(() => {
    Object.values(allNodes).forEach(node => {
      if (node.name === 'Output') {
        node.data.output = ""; // ✅ Reset output field to prevent carry-over issues
      }
    });
  }, 100);
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



async function executeLLMFlow(flowData) {
  const executionOrder = determineExecutionOrder(flowData);
  const storedResponses = {}; // Store responses to avoid redundant API calls

  for (const nodeId of executionOrder) {
    const currentNode = flowData.drawflow.Home.data[nodeId];

    if (currentNode.name === 'LLM Call') {
      console.log(`🚀 Processing LLM Call Node: ${nodeId}`);

      if (storedResponses[nodeId]) {
        console.log(`✅ Using cached response for Node ${nodeId}`);
        currentNode.data.output = storedResponses[nodeId];
      } else {
        const combinedInputs = getSortedInputs(nodeId, flowData);
        console.log("📝 combinedInputs: " + combinedInputs);
        const selectedModel = currentNode.data.selectedModel || 'gpt-3.5-turbo';

        try {
          const response = await callLLMAPI(combinedInputs, selectedModel);
          const messageResponse = response.data.completions[selectedModel].completion.choices[0].message.content;

          console.log(`✅ LLM Call Node (${nodeId}) Response: ${messageResponse}`);

          // ✅ Store and update node output
          currentNode.data.output = messageResponse;
          storedResponses[nodeId] = messageResponse;

          // ✅ Update the UI in real-time
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
        currentNode.data.output = storedResponses[linkedLLMNode];
        console.log(`✅ Output Node (${nodeId}) Displaying: ${storedResponses[linkedLLMNode]}`);

        // ✅ Immediately update the UI
        updateOutputNodes(flowData, nodeId, storedResponses[linkedLLMNode]);
      } else {
        console.warn(`⚠️ Output Node (${nodeId}) has no valid LLM input.`);
      }
    }
  }
}

function updateOutputNodes(flowData, nodeId, responseText) {
  const nodeElement = document.getElementById(`node-${nodeId}`);

  if (nodeElement) {
    const outputDiv = nodeElement.querySelector('.output-response');
    if (outputDiv) {
      outputDiv.innerHTML = responseText;
    }
  }

  // ✅ Also update the stored flow data
  flowData.drawflow.Home.data[nodeId].data.output = responseText;
}

async function waitForInputs(nodeId, flowData) {
  return new Promise(resolve => {
    const checkInputs = () => {
      if (areInputsReady(nodeId, flowData)) {
        console.log(`✅ Inputs for Node ${nodeId} are now ready!`);
        resolve(); // Continue execution
      } else {
        console.log(`⏳ Waiting for inputs for Node ${nodeId}...`);
        setTimeout(checkInputs, 2000); // Recheck after 2 seconds
      }
    };

    checkInputs(); // Initial check
  });
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

function areInputsReady(nodeId, flowData) {
  const node = flowData.drawflow.Home.data[nodeId];

  const inputConnections = Object.values(node.inputs)
    .flatMap(input => input.connections)
    .map(conn => conn.node);

  for (const inputNodeId of inputConnections) {
    const inputNode = flowData.drawflow.Home.data[inputNodeId];

    if (!inputNode) {
      console.error(`❌ Node ${inputNodeId} is missing in flowData!`);
      return false;
    }

    let promptData = "";
    const nodeElement = document.getElementById(`node-${inputNodeId}`);
    if (nodeElement) {
      const promptTextElement = nodeElement.querySelector('.prompt-text-display');
      promptData = promptTextElement ? promptTextElement.innerText.trim() : "";
    }

    // Fallback to stored data if HTML method fails
    if (!promptData) {
      promptData = inputNode.data?.promptText?.trim() || "";
    }

    let outputData = inputNode.data?.output?.trim() || "";

    console.log(`🔍 Checking inputs for Node ${inputNodeId}:`);
    console.log("✅ Output Data:", outputData);
    console.log("✅ Prompt Data:", promptData);

    // 🚨 Check each input node type 🚨
    if (inputNode.name === "Prompt") {
      // ✅ Prompt nodes are always valid inputs
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

// Helper function to call the LLM API
async function callLLMAPI(prompt, model) {
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

