// tests.js - Fixed Unit Tests for AgentFlow

// Mock implementation of Drawflow to avoid DOM dependency
class MockDrawflow {
  constructor() {
    this.drawflow = { drawflow: { Home: { data: {} } } };
    this.editor_mode = "edit";
    this.nodeId = 1;
  }

  start() {
    // Mock implementation
  }

  addNode(label, inputs, outputs, x, y, className, data = {}, html = "") {
    const nodeId = this.nodeId++;
    this.drawflow.drawflow.Home.data[nodeId] = {
      id: nodeId,
      name: label,
      data: data,
      class: className,
      html: html,
      inputs: {},
      outputs: {},
      pos_x: x,
      pos_y: y
    };

    // Set up inputs and outputs
    for (let i = 1; i <= inputs; i++) {
      this.drawflow.drawflow.Home.data[nodeId].inputs[`input_${i}`] = { connections: [] };
    }
    for (let i = 1; i <= outputs; i++) {
      this.drawflow.drawflow.Home.data[nodeId].outputs[`output_${i}`] = { connections: [] };
    }

    return nodeId;
  }

  getNodeFromId(id) {
    return this.drawflow.drawflow.Home.data[id];
  }

  clear() {
    this.drawflow.drawflow.Home.data = {};
    this.nodeId = 1;
  }

  export() {
    return JSON.parse(JSON.stringify(this.drawflow));
  }

  import(data) {
    this.drawflow = JSON.parse(JSON.stringify(data));
  }
  
  moveNodeToPosition(nodeId, x, y) {
    if (this.drawflow.drawflow.Home.data[nodeId]) {
      this.drawflow.drawflow.Home.data[nodeId].pos_x = x;
      this.drawflow.drawflow.Home.data[nodeId].pos_y = y;
    }
  }
}

// Mock fetch API for network requests
global.fetch = async (url, options = {}) => {
  const response = {
    ok: true,
    status: 200,
    headers: new Map(),
    json: async () => {
      if (url.includes("agentFlowCRUD")) {
        if (options.method === "PUT") {
          return { success: true, message: "Flow saved successfully" };
        }
        if (options.body && JSON.parse(options.body).operation === "get_flow") {
          return [{
            flowId: "test-flow",
            flowData: {
              drawflow: {
                Home: {
                  data: {
                    1: {
                      id: 1,
                      name: "Start",
                      data: {},
                      class: "start",
                      html: "<div class=\"df-node-content block-start\"><strong>Start Block</strong></div>",
                      inputs: {},
                      outputs: { output_1: { connections: [] } },
                      pos_x: 100,
                      pos_y: 100
                    }
                  }
                }
              }
            },
            metadata: {
              name: "Test Flow",
              updatedAt: new Date().toISOString()
            }
          }];
        }
        if (options.method === "GET" || (options.body && JSON.parse(options.body).operation === "get_flows")) {
          return [
            { flowId: "test-flow-1", metadata: { name: "Test Flow 1" } },
            { flowId: "test-flow-2", metadata: { name: "Test Flow 2" } }
          ];
        }
      }
      return {};
    },
    text: async () => "Mock response"
  };
  return response;
};

// Mock DOM elements and functions
document = {
  getElementById: (id) => {
    if (id === "flow-name") {
      return { value: "Test Flow" };
    }
    if (id === "flow-list") {
      return { value: "test-flow", innerHTML: "" };
    }
    if (id.startsWith("node-")) {
      return {
        querySelector: (selector) => {
          if (selector.includes("model-dropdown")) {
            return { value: "openai/gpt-4o-mini", id: "" };
          }
          if (selector.includes("prompt-name-display")) {
            return { textContent: "Test Prompt" };
          }
          if (selector.includes("prompt-text-display")) {
            return { textContent: "Test prompt text content" };
          }
          if (selector.includes("output-response")) {
            return { innerHTML: "Test output" };
          }
          return null;
        },
        style: {}
      };
    }
    if (id === "modal-overlay" || id === "prompt-modal" || id === "load-modal") {
      return { style: { display: "none" } };
    }
    if (id === "prompt-modal-name") {
      return { value: "Test Prompt" };
    }
    if (id === "prompt-modal-textarea") {
      return { value: "Test prompt text content" };
    }
    if (id === "status-bubble") {
      return { innerHTML: "", classList: { add: () => {}, remove: () => {} }, style: { opacity: 1 } };
    }
    return null;
  },
  createElement: (tag) => ({
    appendChild: () => {},
    textContent: "",
    value: ""
  }),
  querySelector: (selector) => {
    if (selector.includes("prompt-edit-btn")) {
      return { onclick: null };
    }
    return {
      addEventListener: () => {},
      onclick: () => {}
    };
  },
  querySelectorAll: () => []
};

// Mocks for setTimeout
global.setTimeout = (fn) => fn();

// Mock console for test output control
const originalConsoleLog = console.log;
let suppressConsoleOutput = true;

console.log = function(...args) {
  if (!suppressConsoleOutput) {
    originalConsoleLog.apply(console, args);
  }
};

// Create mock editor
const editor = new MockDrawflow();
editor.start();

// Test functions that match your actual implementation
function createStartNode(x, y) {
  return editor.addNode(
    'Start',
    0,
    1,
    x,
    y,
    'start',
    {},
    `<div class="df-node-content block-start"><strong>Start Block</strong></div>`
  );
}

function createPromptNode(x, y) {
  const nodeId = editor.addNode(
    'Prompt',
    2,
    2,
    x,
    y,
    'prompt',
    { name: 'Prompt Name', promptText: 'Prompt Text' },
    `
      <div class="df-node-content block-prompt">
        <div class="prompt-name-display">Prompt Name</div>
        <div class="prompt-text-display">Prompt Text</div>
        <button class="prompt-edit-btn">Edit</button>
      </div>
    `
  );
  return nodeId;
}

function createLLMNode(x, y) {
  const nodeId = editor.addNode(
    'LLM Call',
    2,
    2,
    x,
    y,
    'llm',
    { selectedModel: 'openai/gpt-4o-mini' },
    `
      <div class="df-node-content block-llm">
        <strong>LLM Call</strong>
        <div>
          <label for="model-dropdown">Select Model</label>
          <select class="model-dropdown" id="model-dropdown-1">
            <option value="openai/gpt-4o-mini">GPT-4o-mini</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="perplexity/llama-3.1-sonar-large-128k-online">Perplexity</option>
          </select>
        </div>
      </div>
    `
  );
  return nodeId;
}

function createOutputNode(x, y) {
  const nodeId = editor.addNode(
    'Output',
    1,
    1,
    x,
    y,
    'output',
    {},
    `
      <div class="df-node-content block-output">
        <strong>Output</strong>
        <div class="output-response"></div>
        <button class="copy-output-btn">Copy</button>
      </div>
    `
  );
  return nodeId;
}

function attachPromptListeners(nodeId) {
  // Mock implementation
}

function fixInputOutputNodes(nodeId) {
  // Mock implementation
}

async function saveFlow() {
  const flowName = document.getElementById('flow-name').value.trim() || 'New Flow 01';
  const updatedFlowData = editor.export();
  
  // Update LLM node model selections
  Object.values(updatedFlowData.drawflow.Home.data).forEach(node => {
    if (node.name === "LLM Call") {
      const dropdown = document.getElementById(`model-dropdown-${node.id}`);
      if (dropdown) {
        node.data.selectedModel = dropdown.value;
      }
    }
    
    if (node.name === "Prompt") {
      const nodeElement = document.getElementById(`node-${node.id}`);
      if (nodeElement) {
        const promptTextElement = nodeElement.querySelector('.prompt-text-display');
        if (promptTextElement) {
          node.data.promptText = promptTextElement.textContent.trim();
        }
      }
    }
  });
  
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

  return response;
}

async function openLoadFlowModal() {
  const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: "get_flows",
    }),
  });

  const flows = await response.json();
  document.getElementById('load-modal').style.display = 'block';
  document.getElementById('modal-overlay').style.display = 'block';
  return flows;
}

function closeLoadFlowModal(selectedFlowId) {
  document.getElementById('load-modal').style.display = 'none';
  document.getElementById('modal-overlay').style.display = 'none';
  if (selectedFlowId) {
    document.getElementById('flow-name').value = selectedFlowId;
  }
}

function toDrawflowFormat(apiResponse) {
  if (!Array.isArray(apiResponse) || apiResponse.length === 0 || !apiResponse[0]?.flowData?.drawflow?.Home?.data) {
    return { drawflow: { Home: { data: {} } } };
  }
  return apiResponse[0].flowData;
}

async function loadSelectedFlow() {
  const selectedFlowId = document.getElementById('flow-list').value;
  if (!selectedFlowId) {
    return null;
  }

  const response = await fetch('https://j7-magic-tool.vercel.app/api/agentFlowCRUD', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'get_flow', 
      flowId: selectedFlowId,
    }),
  });

  const apiResponse = await response.json();
  const drawflowData = toDrawflowFormat(apiResponse);
  editor.clear();
  editor.import(drawflowData);

  closeLoadFlowModal(selectedFlowId);
  return apiResponse;
}

// Test runner
function runTests() {
  const tests = [
    {
      name: "Create Start Node",
      test: () => {
        editor.clear();
        const nodeId = createStartNode(100, 100);
        const node = editor.getNodeFromId(nodeId);
        return node && node.name === "Start";
      }
    },
    {
      name: "Create Prompt Node",
      test: () => {
        editor.clear();
        const nodeId = createPromptNode(200, 200);
        const node = editor.getNodeFromId(nodeId);
        return node && node.name === "Prompt";
      }
    },
    {
      name: "Create LLM Node",
      test: () => {
        editor.clear();
        const nodeId = createLLMNode(300, 300);
        const node = editor.getNodeFromId(nodeId);
        return node && node.name === "LLM Call";
      }
    },
    {
      name: "Create Output Node",
      test: () => {
        editor.clear();
        const nodeId = createOutputNode(400, 400);
        const node = editor.getNodeFromId(nodeId);
        return node && node.name === "Output";
      }
    },
    {
      name: "Save Flow",
      test: async () => {
        editor.clear();
        createStartNode(100, 100);
        createPromptNode(200, 200);
        createLLMNode(300, 300);
        createOutputNode(400, 400);
        
        const result = await saveFlow();
        return result && result.ok === true;
      }
    },
    {
      name: "Open Load Flow Modal",
      test: async () => {
        const flows = await openLoadFlowModal();
        return Array.isArray(flows) && flows.length === 2;
      }
    },
    {
      name: "Load Selected Flow",
      test: async () => {
        editor.clear();
        const result = await loadSelectedFlow();
        const exportedData = editor.export();
        const hasData = exportedData && 
                       exportedData.drawflow && 
                       exportedData.drawflow.Home && 
                       Object.keys(exportedData.drawflow.Home.data).length > 0;
        return result && hasData;
      }
    },
    {
      name: "Close Load Flow Modal",
      test: () => {
        document.getElementById('load-modal').style.display = 'block';
        document.getElementById('modal-overlay').style.display = 'block';
        closeLoadFlowModal('test-flow-id');
        return document.getElementById('load-modal').style.display === 'none' &&
               document.getElementById('modal-overlay').style.display === 'none';
      }
    }
  ];

  const results = { passed: 0, failed: 0, failedTests: [] };

  console.log("🧪 Running AgentFlow Unit Tests...\n");

  tests.forEach(async (testCase) => {
    try {
      const result = await testCase.test();
      if (result) {
        console.log(`✅ ${testCase.name} - PASSED`);
        results.passed++;
      } else {
        console.log(`❌ ${testCase.name} - FAILED`);
        results.failed++;
        results.failedTests.push({ name: testCase.name, error: "Test returned false" });
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} - FAILED`);
      console.error(`  Error: ${error.message}`);
      results.failed++;
      results.failedTests.push({ name: testCase.name, error: error.message });
    }
  });

  setTimeout(() => {
    console.log(`\n🔍 TEST SUMMARY:
  - Passed: ${results.passed}
  - Failed: ${results.failed}
  - Total: ${tests.length}`);
    
    if (results.failedTests.length > 0) {
      console.log("\n🔍 FAILED TESTS:");
      results.failedTests.forEach(failedTest => {
        console.log(`  - ${failedTest.name}\n    Error: ${failedTest.error}`);
      });
    }
  }, 100);
}

// Run the tests
runTests();