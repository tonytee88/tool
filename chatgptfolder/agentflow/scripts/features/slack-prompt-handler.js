/**
 * Handles injection of Slack prompts into flow nodes
 * @param {Object} structuredFlow - The flow data structure
 * @param {string} slackPrompt - The prompt text from Slack
 * @returns {Object} - Modified flow with injected Slack prompts
 */
function injectSlackPrompt(structuredFlow, slackPrompt) {
    if (!structuredFlow || !slackPrompt) {
        console.warn("⚠️ Missing required data for Slack prompt injection");
        return structuredFlow;
    }

    console.log("🔍 Checking for Slack prompt blocks...");
    let modifiedCount = 0;

    // Iterate through all nodes
    Object.entries(structuredFlow).forEach(([nodeId, node]) => {
        console.log("structuredFlow", structuredFlow);
        console.log("structuredFlow", JSON.stringify(structuredFlow, null, 2));
        if (node.name === 'Prompt') {
            const promptName = node.data?.name?.toLowerCase() || '';
            const promptText = node.data?.promptText || '';

            // Check if this prompt block should receive the Slack prompt
            console.log("checking promptName", promptName);
            if (promptName.includes('slack') || promptText.toLowerCase().includes('slack')) {
                console.log(`✨ Found Slack prompt block: ${nodeId}`);
                
                // Store original prompt for reference
                node.data.originalPromptText = promptText;
                
                // Inject the Slack prompt
                node.data.promptText = slackPrompt;
                
                console.log(`✅ Injected Slack prompt into node ${nodeId}`);
                modifiedCount++;
            }
        }
    });

    console.log(`📊 Modified ${modifiedCount} prompt blocks with Slack input`);
    return structuredFlow;
}

module.exports = {
    injectSlackPrompt
}; 