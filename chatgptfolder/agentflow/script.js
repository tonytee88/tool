// Initialize Drawflow
const editor = new Drawflow(document.getElementById("drawflow"));
editor.start();
editor.editor_mode = "edit";
editor.moveNodeToPosition = function(nodeId, x, y) {
  if (this.drawflow.drawflow.Home.data[nodeId]) {
    // Update the node's position in the data model
    this.drawflow.drawflow.Home.data[nodeId].pos_x = x;
    this.drawflow.drawflow.Home.data[nodeId].pos_y = y;
    
    // Update the node's position in the DOM
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      nodeElement.style.top = `${y}px`;
      nodeElement.style.left = `${x}px`;
    }
    
    // Redraw connections if needed
    this.updateConnectionNodes(`node-${nodeId}`);
  }
};

// Track which node is being edited in the modal
let currentEditNodeId = null;
let currentZoom = 1; // Start at 100% zoom instead of 20%
let delayPerNode = 8000;
let delayBetweenPoll = 8000;

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
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    closePromptModal(false);
    closeLoadFlowModal();
  }
});

//zoom
document.getElementById('btn-zoom-in').addEventListener('click', () => {
  if (currentZoom < 1.5) { // Limit max zoom to 150% (was 2)
    currentZoom += 0.1;
    editor.zoom_in();
  }
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  if (currentZoom > 0.5) { // Don't allow below 50% (was 0.2)
    currentZoom -= 0.1;
    editor.zoom_out();
  }
});

document.getElementById('btn-reset-zoom').addEventListener('click', () => {
  currentZoom = 1;
  editor.zoom_reset();
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

  // ✅ Get the current flow data
  const updatedFlowData = editor.export();

  // ✅ Ensure all nodes have their latest data before saving
  Object.values(updatedFlowData.drawflow.Home.data).forEach(node => {
    // Handle LLM Call nodes
    if (node.name === "LLM Call") {
      const dropdown = document.getElementById(`model-dropdown-${node.id}`);
      if (dropdown) {
        node.data.selectedModel = dropdown.value;
        console.log(`📥 Saved model selection for Node ${node.id}:`, dropdown.value);
      }
    }

    // Handle Prompt nodes
    if (node.name === "Prompt") {
      const nodeElement = document.getElementById(`node-${node.id}`);
      if (nodeElement) {
        const promptNameElement = nodeElement.querySelector('.prompt-name-display');
        const promptTextElement = nodeElement.querySelector('.prompt-text-display');
        
        if (promptNameElement && promptTextElement) {
          // Save both name and text
          node.data = {
            ...node.data,
            name: promptNameElement.textContent.trim(),
            promptText: promptTextElement.textContent.trim()
          };
          console.log(`📥 Saved prompt data for Node ${node.id}:`, {
            name: node.data.name,
            promptText: node.data.promptText.substring(0, 50) + '...'
          });
        }
      }
    }
  });

  // ✅ Call the API to save the updated flow
  try {
    const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: "save_flow",
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

    console.log("✅ Flow saved successfully!");
  } catch (error) {
    console.error('❌ Error saving flow:', error);
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: "get_flows", // 🌟 Fetch list of all saved flows
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve flows');
    }

    const flows = await response.json();
    const flowList = document.getElementById('flow-list');
    flowList.innerHTML = '';

    flows.forEach(flow => {
      const option = document.createElement('option');
      option.value = flow.flowId;
      option.textContent = flow.metadata?.name || flow.flowId;
      flowList.appendChild(option);
    });

    document.getElementById('load-modal').style.display = 'block';
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.style.display = 'block';
  } catch (error) {
    console.error('Error listing flows:', error);
    alert('Failed to load flows');
  }
}

  
// Function to close the load flow modal
function closeLoadFlowModal(selectedFlowId) {
  document.getElementById('load-modal').style.display = 'none';
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.style.display = 'none';
  if (selectedFlowId) {
    document.getElementById('flow-name').value = selectedFlowId;
  }
}

function toDrawflowFormat(apiResponse) {
  //console.log("🛠 Raw API Response:", JSON.stringify(apiResponse, null, 2));

  // If response is an object, wrap it in an array
  if (!Array.isArray(apiResponse)) {
      apiResponse = [apiResponse];
  }

  // Check if we have valid data
  if (apiResponse.length === 0 || !apiResponse[0]?.flowData?.drawflow?.Home?.data) {
      console.error('❌ Data structure is not as expected or response is empty');
      return createDefaultFlow();
  }

  // Extract the drawflow data
  const drawflowData = apiResponse[0].flowData;

  if (!drawflowData || Object.keys(drawflowData.drawflow.Home.data).length === 0) {
      console.warn('⚠️ Flow data is empty or missing, returning default flow.');
      return createDefaultFlow();
  }

  return drawflowData;
}


async function loadSelectedFlow() {
  try {
    const selectedFlowId = document.getElementById('flow-list').value;

    if (!selectedFlowId) {
      alert('Please select a flow to load');
      return;
    }

    const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'get_flow',
        flowId: selectedFlowId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse = await response.json();
    if (!apiResponse) throw new Error('Empty response from API');
    
    const drawflowData = toDrawflowFormat(apiResponse);
    editor.clear();
    editor.import(drawflowData);

    // Store the original positions of the nodes
    const originalPositions = {};
    Object.values(drawflowData.drawflow.Home.data).forEach(node => {
      originalPositions[node.id] = { x: node.pos_x, y: node.pos_y };
    });

    // Move the nodes slightly to trigger the UI update
    setTimeout(() => {
      Object.values(drawflowData.drawflow.Home.data).forEach(node => {
        editor.moveNodeToPosition(node.id, node.pos_x + 1, node.pos_y + 1);
        
        // Update prompt nodes
        if (node.name === "Prompt") {
          const nodeElement = document.getElementById(`node-${node.id}`);
          if (nodeElement) {
            const nameDisplay = nodeElement.querySelector('.prompt-name-display');
            const textDisplay = nodeElement.querySelector('.prompt-text-display');
            
            if (nameDisplay) nameDisplay.textContent = node.data?.name || 'New Prompt';
            if (textDisplay) textDisplay.textContent = node.data?.promptText || '';
          }
        }
        
        // Update LLM nodes
        if (node.name === "LLM Call") {
          const dropdown = document.getElementById(`model-dropdown-${node.id}`);
          if (dropdown) {
            dropdown.value = node.data?.selectedModel || 'openai/gpt-4o-mini';
          }
        }

        fixInputOutputNodes(node.id);
      });
    }, 100);

    // Move nodes back to original positions
    setTimeout(() => {
      Object.entries(originalPositions).forEach(([nodeId, { x, y }]) => {
        editor.moveNodeToPosition(nodeId, x, y);
      });
    }, 200);

    reattachAllListeners();
    closeLoadFlowModal(selectedFlowId);
  } catch (error) {
    console.error('❌ Error loading flow:', error);
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
    2, // inputs
    2, // outputs
    x,
    y,
    'prompt', // CSS class/type
    { 
      name: 'New Prompt',      // Default name
      promptText: '',          // Empty default text
      originalPromptText: ''   // For storing original text when using Slack prompts
    },
    `
      <div class="df-node-content block-prompt">
        <div class="prompt-name-display" style="color: white; font-size: 14px; font-weight: bold;">New Prompt</div>
        <div class="prompt-text-display" style="color: white; font-size: 12px; margin-top: 5px;">Click Edit to add prompt text</div>
        <button class="prompt-edit-btn" style="margin-top: 10px;">Edit</button>
      </div>
    `
  );
  fixInputOutputNodes(nodeId);
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

function openPromptModal(nodeId) {
  currentEditNodeId = nodeId;
  const node = editor.getNodeFromId(nodeId);
  if (!node) return;

  // Get modal input elements
  const promptModalNameInput = document.getElementById('prompt-modal-name');
  const promptModalTextarea = document.getElementById('prompt-modal-textarea');

  // Load values from the node's data
  promptModalNameInput.value = node.data?.name || 'New Prompt';
  promptModalTextarea.value = node.data?.promptText || '';

  // Show the modal and overlay
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.style.display = 'block';
  document.getElementById('prompt-modal').style.display = 'block';
}

// --- LLM NODE ---
function createLLMNode(x, y) {
  // ✅ Add node first and get its ID
  const nodeId = editor.addNode(
    'LLM Call',
    2,
    2,
    x,
    y,
    'llm',
    { selectedModel: 'openai/gpt-4o-mini' }, // ✅ Default model
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
  fixInputOutputNodes(nodeId)
  // ✅ After node is created, set correct ID for dropdown
  setTimeout(() => {
    const dropdown = document.querySelector(`#node-${nodeId} .model-dropdown`);
    if (dropdown) {
      dropdown.id = `model-dropdown-${nodeId}`; // ✅ Set correct ID
    }
  }, 100);

  
}



// --- OUTPUT NODE ---
function createOutputNode(x, y) {
  nodeId = editor.addNode(
    'Output',
    2, // Inputs
    2, // 1 Output now correctly placed
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
  fixInputOutputNodes(nodeId)
}

  //fixing node positionning
  function fixInputOutputNodes(nodeId) {
    const nodeElement = document.querySelector(`#node-${nodeId}`);
    if (!nodeElement) return;
  
    // Get the actual height of the node
    const nodeHeight = nodeElement.offsetHeight;
    const totalHeight = nodeHeight + 2; // Add 6px spacing
  
    // Move the second input to the TOP
    const inputPorts = nodeElement.querySelectorAll(".input");
    if (inputPorts.length > 1) {
      inputPorts[1].style.position = "absolute";
      inputPorts[1].style.top = "-28px"; // Move it above the node
      inputPorts[1].style.left = "50%"; // Center it horizontally
      inputPorts[1].style.transform = "translateX(-50%)";
    }
  
    // Move the second output to the correct position (below the node)
    const outputPorts = nodeElement.querySelectorAll(".output");
    if (outputPorts.length > 1) {
      outputPorts[1].style.position = "absolute";
      outputPorts[1].style.top = `${totalHeight}px`; // Move it below the node
      outputPorts[1].style.left = "50%"; // Center it horizontally
      outputPorts[1].style.transform = "translateX(-50%)";
    }
  }
  
function attachOutputListeners(nodeId) {
  setTimeout(() => { // Add slight delay to ensure elements exist
    document.addEventListener("click", function (event) {
      if (event.target.classList.contains("copy-output-btn")) {
        const nodeElement = event.target.closest(".df-node-content"); // Find the parent node
        if (!nodeElement) return;
    
        const outputDiv = nodeElement.querySelector(".output-response");
        if (!outputDiv) {
          console.error("Output div not found!");
          return;
        }
    
        navigator.clipboard.writeText(outputDiv.innerText)
          .then(() => console.log("✅ Output copied to clipboard!"))
          .catch(err => console.error("❌ Failed to copy text: ", err));
      }
    })
})};


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

      // Save both name and text to the node's data
      node.data = {
        ...node.data,
        name: promptModalNameInput.value.trim(),
        promptText: promptModalTextarea.value.trim()
      };

      // Update the node display
      const nodeElement = document.querySelector(`#node-${currentEditNodeId} .df-node-content.block-prompt`);
      if (nodeElement) {
        const nameDisplay = nodeElement.querySelector('.prompt-name-display');
        const textDisplay = nodeElement.querySelector('.prompt-text-display');

        if (nameDisplay) nameDisplay.textContent = node.data.name;
        if (textDisplay) textDisplay.textContent = node.data.promptText;
      }

      console.log(`✅ Updated prompt node ${currentEditNodeId}:`, {
        name: node.data.name,
        promptText: node.data.promptText.substring(0, 50) + '...'
      });
    }
  }

  // Hide both the modal and overlay
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.style.display = 'none';
  document.getElementById('prompt-modal').style.display = 'none';
  currentEditNodeId = null;
}


// =========================================================================================================
//flow execution!
// =========================================================================================================


async function startFlowExecution() {
  // Ensure the flow is saved and UI outputs are cleared.
  await saveFlow();
  storedResponses = {}; // Clear previous responses
  clearOutputNodes();
  var total = getTotalResponseCount();

  const flowName = document.getElementById('flow-name').value.trim() || 'New Flow 01z';
  const delay = addDelayToPolling();

  updateStatusBubble(0, total); // 🌟 Initialize status bubble
  document.getElementById("status-bubble").style.opacity = "1"; // 🌟 Make it visible

  const executionId = `exec_${Date.now()}`; // 🔥 Generate unique execution ID
  const channelId = "nochan"; 
  const callbackUrl = "https://j7-magic-tool.vercel.app/api/slack?operation=receive_response";
  

  await callBrowserFlow(flowName, channelId, callbackUrl, executionId);
  
  setTimeout(() => pollForResponses(executionId), delay);

}

async function callBrowserFlow(flowName, channelId, callbackUrl, executionId) {
  const endpointUrl = "https://j7-magic-tool.vercel.app/api/slack?operation=notslack";

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ flowName, channelId, callbackUrl, executionId })
    });

    if (!response.ok) {
      // Optionally, read the error message from the response body
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Flow executed successfully:", data);
    return data;
  } catch (error) {
    console.error("Error executing flow:", error);
    throw error;
  }
}

function addDelayToPolling() {
  // ✅ Count LLM Nodes to determine delay
  const flowData = editor.export();
  const nodeEntries = Object.entries(flowData.drawflow.Home.data);
  const llmCount = nodeEntries.filter(([_, node]) => node.name === "LLM Call").length;
  console.log("adddelaypolling function count : " + llmCount);
  
  const delayBeforePolling = llmCount * delayPerNode; // 🌟 3 sec per LLM Call
  console.log(`⏳ Waiting ${delayBeforePolling / 1000} seconds before polling responses...`);
  return delayBeforePolling
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

async function updateUIWithResults(responses) {
  console.log(`📡 Updating UI with ${responses.length} responses...`);

  if (!Array.isArray(responses) || responses.length === 0) {
      console.warn("⚠️ No valid responses received for UI update.");
      return;
  }

  responses.forEach(({ nodeId, content }) => {
      const nodeElement = document.querySelector(`#node-${nodeId} .output-response`);

      if (nodeElement) {
          console.log(`🔄 Updating UI for Output Node ${nodeId}`);
          nodeElement.innerHTML = formatTextAsHTML(content); // ✅ Properly format & update UI
      } else {
          console.warn(`⚠️ UI Element not found for Node ID ${nodeId}.`);
      }
  });

  console.log("✅ UI updated with responses!");
}

function getTotalResponseCount() {
  const flowData = editor.export();
  const nodeEntries = Object.entries(flowData.drawflow.Home.data);
  const llmNodes = nodeEntries.filter(([_, node]) => node.name === "LLM Call");
  const outputNodes = nodeEntries.filter(([_, node]) => node.name === "Output");
  
  // Count the total responses we expect (all LLM nodes and all Output nodes)
  return llmNodes.length + outputNodes.length;
}

async function pollForResponses(executionId, maxAttempts = 10, attempt = 1) {
  console.log(`🔍 Checking MongoDB for Execution ID: ${executionId} (Attempt ${attempt}/${maxAttempts})`);
  var total = getTotalResponseCount();
  try {
      const response = await fetch("https://j7-magic-tool.vercel.app/api/agentFlowCRUD", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              operation: "get_all_responses",
              executionId
          })
      });

      const data = await response.json();
      console.log("📡 Retrieved responses:", data);

      const receivedResponses = data.length; // ✅ Count responses received
      updateStatusBubble(receivedResponses, total); // 🌟 Update status

      // ✅ Extract output nodes
      const flowData = editor.export();
      const outputNodes = Object.entries(flowData.drawflow.Home.data)
          .filter(([_, node]) => node.name === "Output")
          .map(([nodeId, _]) => nodeId);

      console.log(`🔎 Tracking ${outputNodes.length} Output Nodes:`, outputNodes);

      // ✅ Check if **all** Output Nodes have responses
      const allOutputsReady = outputNodes.every(nodeId =>
          data.some(response => response.nodeId === nodeId && response.content !== null)
      );

      if (allOutputsReady) {
          console.log("✅ All Output Nodes received responses! Updating UI...");
          updateUIWithResults(data);

          console.log("🗑️ Cleaning up responses from DB...");
          await fetch("https://j7-magic-tool.vercel.app/api/agentFlowCRUD", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  operation: "delete_response",
                  executionId
              })
          });

          console.log("✅ Responses deleted successfully!");

          // 🌟 Track Execution Count & Cleanup Old Data Every 20 Runs
          console.log("📊 Updating execution count in MongoDB...");
          await trackExecutionAndCleanup();

          return; // 🌟 Stop polling!
      }

      if (attempt < maxAttempts) {
          console.log(`⏳ Responses not complete yet... Retrying in 8s`);
          setTimeout(() => pollForResponses(executionId, maxAttempts, attempt + 1), delayBetweenPoll);
      } else {
          console.warn("⚠️ Max polling attempts reached. Some responses may still be missing.");
      }

  } catch (error) {
      console.error("❌ Error fetching responses:", error);
      if (attempt < maxAttempts) {
          setTimeout(() => pollForResponses(executionId, maxAttempts, attempt + 1), 5000);
      }
  }
}


async function trackExecutionAndCleanup() {
  try {
      const response = await fetch("https://j7-magic-tool.vercel.app/api/agentFlowCRUD", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              operation: "track_execution",
              requestType_count: "execution_browser"
          })
      });

      const data = await response.json();

      if (data.error) {
          console.error("❌ Error from API:", data.error);
          return;
      }

      const executionCount = data.execution_browser;
      console.log(`📊 Execution Count Updated: ${executionCount}`);
      console.log("📊 If count is a multiple of 20, cleanup has been triggered!");

  } catch (error) {
      console.error("❌ Error updating execution count or cleaning up old data:", error);
  }
}

function updateStatusBubble(received, total) {
  const statusBubble = document.getElementById("status-bubble");
  if (!statusBubble) return;

  statusBubble.innerHTML = `${received} / ${total}`; // 🔥 Update text

  if (received >= total) {
    statusBubble.classList.add("completed"); // ✅ Add completed state if all responses are received
  } else {
    statusBubble.classList.remove("completed");
  }
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

        // ✅ Get latest model selection from UI
        const nodeElement = document.getElementById(`node-${nodeId}`);
        const modelDropdown = nodeElement?.querySelector('.model-dropdown');
        const selectedModel = modelDropdown?.value || currentNode.data.selectedModel || 'openai/gpt-4o-mini';

        // ✅ Ensure the model selection is stored correctly in node data
        currentNode.data.selectedModel = selectedModel;
        console.log(`📝 Model selected for Node ${nodeId}: ${selectedModel}`);

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
        const formattedResponse = formatTextAsHTML(storedResponses[linkedLLMNode]);
        currentNode.data.output = formattedResponse;

        console.log(`✅ Output Node (${nodeId}) Displaying:`, formattedResponse);

        // ✅ Immediately update the UI using the formatted response
        updateOutputNodes(flowData, nodeId, formattedResponse);

        setTimeout(() => {
          const nodeElement = document.getElementById(`node-${nodeId}`);
          if (nodeElement) {
            const outputDiv = nodeElement.querySelector('.output-response');
            if (outputDiv) {
              outputDiv.innerHTML = formattedResponse;
            }

            // ✅ Attach listener here after rendering
            attachOutputListeners(nodeId);
          }
        }, 100);
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

