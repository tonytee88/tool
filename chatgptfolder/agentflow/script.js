    // Initialize Drawflow
    const editor = new Drawflow(document.getElementById("drawflow"));
    editor.start();
    editor.editor_mode = "edit";

    // Track which node is being edited in the modal
    let currentEditNodeId = null;

    // BIND THE TOOLBAR BUTTONS
    document.getElementById('btn-add-start').addEventListener('click', () => addNode('start'));
    document.getElementById('btn-add-prompt').addEventListener('click', () => addNode('prompt'));
    document.getElementById('btn-add-llm').addEventListener('click', () => addNode('llm'));
    document.getElementById('btn-add-output').addEventListener('click', () => addNode('output'));
    //document.getElementById('btn-export').addEventListener('click', exportFlow);
    //document.getElementById('btn-import').addEventListener('click', importFlow);
    document.getElementById('btn-save').addEventListener('click', saveFlow);
    document.getElementById('btn-load').addEventListener('click', openLoadFlowModal);
    document.getElementById('load-confirm').addEventListener('click', loadSelectedFlow);
    document.getElementById('load-cancel').addEventListener('click', closeLoadFlowModal);
    
    // BIND THE MODAL EVENTS
    const modalOverlay = document.getElementById('modal-overlay');
    const promptModal = document.getElementById('prompt-modal');
    const promptModalTextarea = document.getElementById('prompt-modal-textarea');
    document.getElementById('modal-save').addEventListener('click', () => closePromptModal(true));
    document.getElementById('modal-cancel').addEventListener('click', () => closePromptModal(false));
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

    // New function to save the flow
async function saveFlow() {
    const flowName = document.getElementById('flow-name').value.trim() || 'New Flow 01';
    const flowData = editor.export();
    
    try {
      const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId: flowName, // Use flow name as unique identifier
          flowData,
          metadata: {
            name: flowName,
            updatedAt: new Date().toISOString()
          }
        })
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
  
  // New function to load selected flow
  async function loadSelectedFlow() {
    const flowList = document.getElementById('flow-list');
    const selectedFlowId = flowList.value;
  
    if (!selectedFlowId) {
      alert('Please select a flow to load');
      return;
    }
  
    try {
      const response = await fetch(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${selectedFlowId}`, {
        method: 'GET'
      });
  
      if (!response.ok) {
        throw new Error('Failed to retrieve flow');
      }
  
      const { flowData } = await response.json();
      
      // Clear existing flow
      editor.clear();
      
      // Import the selected flow
      editor.import(flowData);
  
      // Set the flow name in the input
      document.getElementById('flow-name').value = selectedFlowId;
  
      // Close the modal
      closeLoadFlowModal();
  
      // Re-attach any necessary listeners
      reattachAllListeners();
    } catch (error) {
      console.error('Error loading flow:', error);
      alert('Failed to load flow');
    }
  }
  
  // Function to close the load flow modal
  function closeLoadFlowModal() {
    document.getElementById('load-modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
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
          1,  // inputs
          1,  // outputs
          x,
          y,
          'prompt',                  // CSS class/type
          { name: 'Prompt Node', promptText: '' }, // node.data
          `
            <div class="df-node-content block-prompt">
              <strong>Prompt Block</strong>
              <div>
                <input
                  class="prompt-name"
                  type="text"
                  placeholder="Block name"
                  value="Prompt Node"
                />
                <button class="prompt-edit-btn">Edit</button>
              </div>
            </div>
          `
        );
      
        // Wait for the node to mount in the DOM, then attach events
        setTimeout(() => attachPromptListeners(nodeId), 0);
      }

    // Attach event listeners for the newly created Prompt node
    function attachPromptListeners(nodeId) {
        const nodeElement = document.querySelector(`#node-${nodeId} .df-node-content.block-prompt`);
        if (!nodeElement) return;
        
        // Get the node data
        const node = editor.getNodeFromId(nodeId);
        
        // Initialize preview if there's existing text
        if (node && node.data.promptText) {
            const previewDiv = nodeElement.querySelector('.prompt-preview');
            if (previewDiv) {
                previewDiv.textContent = node.data.promptText.length > 50 
                    ? node.data.promptText.substring(0, 50) + '...' 
                    : node.data.promptText;
            }
        }
        
        // Existing listeners
        const nameInput = nodeElement.querySelector('.prompt-name');
        nameInput?.addEventListener('input', () => {
            updatePromptName(nameInput.value, nodeId);
        });
        
        const editButton = nodeElement.querySelector('.prompt-edit-btn');
        editButton?.addEventListener('click', () => {
            openPromptModal(nodeId);
        });
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
    
      // Populate the modal textarea with the current prompt text
      document.getElementById('prompt-modal-textarea').value = node.data.promptText || '';
    
      // Show the modal + overlay
      document.getElementById('modal-overlay').style.display = 'block';
      document.getElementById('prompt-modal').style.display = 'block';
    }

    // Close the modal, optionally saving
    function closePromptModal(doSave) {
        if (currentEditNodeId !== null && doSave) {
          const node = editor.getNodeFromId(currentEditNodeId);
          if (node) {
            // Grab the textarea value and store it
            const newText = document.getElementById('prompt-modal-textarea').value;
            node.data.promptText = newText;
          }
        }
      
        // Hide modal & overlay
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

 // Export and save flow
async function exportFlow() {
    const flowData = editor.export();
    
    try {
      // Generate a unique flowId (you might want a more robust method)
      const flowId = `flow_${Date.now()}`;
      
      const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId,
          flowData,
          metadata: {
            name: prompt("Enter a name for this flow:") || "Unnamed Flow",
            createdAt: new Date().toISOString()
          }
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to save flow');
      }
  
      const result = await response.json();
      alert(`Flow saved successfully with ID: ${flowId}`);
      
      // Optionally store the flowId locally or in state
      localStorage.setItem('currentFlowId', flowId);
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Failed to save flow');
    }
  }
  
  // Modify importFlow to support retrieving saved flows
  async function importFlow() {
    const flowId = prompt("Enter the Flow ID to import:");
    if (!flowId) return;
  
    try {
      // You'll need to add a GET method to retrieve flows in your serverless function
      const response = await fetch(`https://j7-magic-tool.vercel.app/api/agentFlowCRUD?flowId=${flowId}`, {
        method: 'GET'
      });
  
      if (!response.ok) {
        throw new Error('Failed to retrieve flow');
      }
  
      const { flowData } = await response.json();
      
      editor.clear();
      editor.import(flowData);
  
      // Re-attach prompt node listeners after import
      reattachAllListeners();
    } catch (error) {
      console.error('Error importing flow:', error);
      alert('Failed to import flow');
    }
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

    // Helper function to re-attach listeners to imported nodes
    function reattachAllListeners() {
        // Find all prompt nodes and re-attach listeners
        editor.nodes.forEach(node => {
        if (node.class === 'prompt') {
            attachPromptListeners(node.id);
        }
        });
    }