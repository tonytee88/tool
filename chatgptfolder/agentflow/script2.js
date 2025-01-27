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
document.querySelector('#prompt-modal button[onclick^="closePromptModal(true)"]')
  .addEventListener('click', () => closePromptModal(true));
document.querySelector('#prompt-modal button[onclick^="closePromptModal(false)"]')
  .addEventListener('click', () => closePromptModal(false));
modalOverlay.addEventListener('click', () => closePromptModal(false));

// Function to create a prompt node
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
          <textarea
            class="prompt-content"
            placeholder="Prompt content"
          ></textarea>
          <div class="prompt-preview"></div>
          <button class="prompt-edit-btn">Edit</button>
        </div>
      </div>
    `
  );

  // Wait for the node to mount in the DOM, then attach events
  setTimeout(() => attachPromptListeners(nodeId), 0);
}

function attachPromptListeners(nodeId) {
  const nodeElement = document.querySelector(`#node-${nodeId} .df-node-content.block-prompt`);
  if (!nodeElement) return;

  // Get the node data
  const node = editor.getNodeFromId(nodeId);

  // Initialize preview
  const previewDiv = nodeElement.querySelector('.prompt-preview');
  if (previewDiv) {
    previewDiv.textContent = node.data.promptText.length > 50 
      ? node.data.promptText.substring(0, 50) + '...'
      : node.data.promptText;
  }

  // Existing listeners
  const nameInput = nodeElement.querySelector('.prompt-name');
  nameInput?.addEventListener('input', () => {
    updatePromptName(nameInput.value, nodeId);
  });

  const contentTextarea = nodeElement.querySelector('.prompt-content');
  contentTextarea?.addEventListener('input', () => {
    updatePromptContent(contentTextarea.value, nodeId, previewDiv);
  });

  const editButton = nodeElement.querySelector('.prompt-edit-btn');
  editButton?.addEventListener('click', () => {
    openPromptModal(nodeId);
  });
}

function openPromptModal(nodeId) {
  currentEditNodeId = nodeId;
  const node = editor.getNodeFromId(nodeId);
  if (!node) return;

  // Populate the modal inputs with the current prompt data
  promptModalNameInput.value = node.data.name;
  promptModalTextarea.value = node.data.promptText || '';

  // Show the modal + overlay
  modalOverlay.style.display = 'block';
  promptModal.style.display = 'block';
}

function closePromptModal(doSave) {
  if (currentEditNodeId !== null && doSave) {
    const node = editor.getNodeFromId(currentEditNodeId);
    if (node) {
      // Grab the input and textarea values and store them
      node.data.name = promptModalNameInput.value;
      node.data.promptText = promptModalTextarea.value;

      // Update the prompt preview
      const nodeElement = document.querySelector(`#node-${currentEditNodeId} .df-node-content.block-prompt`);
      const previewDiv = nodeElement.querySelector('.prompt-preview');
      previewDiv.textContent = node.data.promptText.length > 50 
        ? node.data.promptText.substring(0, 50) + '...'
        : node.data.promptText;
    }
  }

  // Hide modal & overlay
  modalOverlay.style.display = 'none';
  promptModal.style.display = 'none';
  currentEditNodeId = null;
}

function updatePromptName(value, nodeId) {
  const node = editor.getNodeFromId(nodeId);
  if (node) {
    node.data.name = value;
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

function saveFlow() {
  // Implement save flow functionality here
  console.log('Saving flow...');
}

function openLoadFlowModal() {
  // Implement load flow functionality here
  console.log('Opening load flow modal...');
}

function loadSelectedFlow() {
  // Implement load selected flow functionality here
  console.log('Loading selected flow...');
}

function closeLoadFlowModal() {
  // Implement close load flow modal functionality here
  console.log('Closing load flow modal...');
}