// Initialize Drawflow
const editor = new Drawflow(document.getElementById("drawflow"));
editor.start();
editor.editor_mode = "edit";

// Track which node is being edited in the modal
let currentEditNodeId = null;

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

// BIND THE MODAL EVENTS
const modalSaveButton = document.querySelector('#prompt-modal button[onclick^="closePromptModal(true)"]');
const modalCancelButton = document.querySelector('#prompt-modal button[onclick^="closePromptModal(false)"]');

modalSaveButton.addEventListener('click', () => closePromptModal(true));
modalCancelButton.addEventListener('click', () => closePromptModal(false));
modalOverlay.addEventListener('click', () => closePromptModal(false));

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

async function saveFlow() {
  const flowName = document.getElementById('flow-name').value.trim() || 'New Flow 01';

  // Export the current flow data to get the list of nodes
  const flowData = editor.export();
  const nodes = Object.entries(flowData.drawflow.Home.data); // Array of node entries
  const nodeCount = nodes.length; // Total number of nodes in the flow

  //console.log(`Found ${nodeCount} nodes in the flow.`);

  // Loop through the nodes in the current flow on display
  nodes.forEach(([nodeId, nodeData]) => {
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      // Extract the required HTML using a helper function
      const updatedHtml = extractContentNodeHtml(nodeElement);

      // Update Drawflow's internal data structure
      editor.drawflow.drawflow.Home.data[nodeId].html = updatedHtml;

      //console.log(`Updated node ${nodeId} with new HTML:`, updatedHtml);
    }
  });

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
    alert(`Flow "${flowName}" saved successfully!`);
  } catch (error) {
    console.error('Error saving flow:', error);
    alert('Failed to save flow');
  }
}

function extractContentNodeHtml(nodeElement) {
  // Clone the node to avoid modifying the original
  const clonedNode = nodeElement.cloneNode(true);

  // Remove the "inputs" and "outputs" divs
  const inputs = clonedNode.querySelector('.inputs');
  if (inputs) inputs.remove();

  const outputs = clonedNode.querySelector('.outputs');
  if (outputs) outputs.remove();

  // Get the HTML of the "drawflow_content_node" div
  const contentNode = clonedNode.querySelector('.drawflow_content_node');
  if (contentNode) {
    return contentNode.outerHTML;
  } else {
    console.error('No drawflow_content_node found in node:', nodeElement);
    return '';
  }
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
  const node = editor.getNodeFromId(nodeId);
  if (!node) return;

  // Populate the modal fields with node data
  const promptModalNameInput = document.getElementById('prompt-modal-name');
  const promptModalTextarea = document.getElementById('prompt-modal-textarea');

  const promptNameDiv = document.querySelector('.prompt-name-display');
  const promptTextDiv = document.querySelector('.prompt-text-display');

  promptModalNameInput.value = promptNameDiv.textContent || '';
  promptModalTextarea.value = promptTextDiv.textContent || '';

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
    1,
    1,
    x,
    y,
    'llm',
    {},
    `
      <div class="df-node-content block-llm">
        <strong>LLM Call</strong>
        <div>Model dropdown / config</div>
      </div>
    `
  );
}

// --- OUTPUT NODE ---
function createOutputNode(x, y) {
  editor.addNode(
    'Output',
    1,
    0,
    x,
    y,
    'output',
    {},
    `
      <div class="df-node-content block-output">
        <strong>Output Block</strong>
        <div>LLM response displayed</div>
      </div>
    `
  );
}

//  // Export and save flow
// async function exportFlow() {
//     const flowData = editor.export();
    
//     try {
//       // Generate a unique flowId (you might want a more robust method)
//       const flowId = `flow_${Date.now()}`;
      
//       const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           flowId,
//           flowData,
//           metadata: {
//             name: prompt("Enter a name for this flow:") || "Unnamed Flow",
//             createdAt: new Date().toISOString()
//           }
//         })
//       });
  
//       if (!response.ok) {
//         throw new Error('Failed to save flow');
//       }
  
//       const result = await response.json();
//       alert(`Flow saved successfully with ID: ${flowId}`);
      
//       // Optionally store the flowId locally or in state
//       localStorage.setItem('currentFlowId', flowId);
//     } catch (error) {
//       console.error('Error saving flow:', error);
//       alert('Failed to save flow');
//     }
//   }
  
//   // Modify importFlow to support retrieving saved flows
//   async function importFlow() {
//     const flowId = prompt("Enter the Flow ID to import:");
//     if (!flowId) return;
  
//     try {
//       // You'll need to add a GET method to retrieve flows in your serverless function
//       const response = await fetch(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${flowId}`, {
//         method: 'GET'
//       });
  
//       if (!response.ok) {
//         throw new Error('Failed to retrieve flow');
//       }
  
//       const { flowData } = await response.json();
      
//       editor.clear();
//       editor.import(flowData);
  
//       // Re-attach prompt node listeners after import
//       reattachAllListeners();
//     } catch (error) {
//       console.error('Error importing flow:', error);
//       alert('Failed to import flow');
//     }
//   }
  
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

function truncateDisplayedText(textarea) {
  const maxLength = 100;
  
  // Store the full input
  fullPromptText = textarea.value;

  // Display only the first 100 characters
  if (textarea.value.length > maxLength) {
    textarea.value = textarea.value.substring(0, maxLength);
  }
}

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


