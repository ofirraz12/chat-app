import express from 'express';
import fs from 'fs';
import path from 'path';
import { buildToolkit } from '../utils/toolkitBuilder.js';
import { handleGroqRequest } from '../services/groq_service.js';
import { handleOllamaRequest } from '../services/ollama_service.js';
import findFileRecursively from '../utils/findFile.js';
import { runToolByName } from '../utils/toolRunner.js';

const router = express.Router();

router.post('/message', async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt || !model) {
        return res.status(400).json({ message: 'Prompt and model are required' });
    }

    const user_prompt = prompt;

    try {
        const toolkit = buildToolkit();
        const assessmentDir = path.join(process.cwd(), 'LLM', 'assessment');
        const analysisScript =
`You are a personal trainer assistant AI.
Your job is to analyze the user's message and determine which tools and scripts from the provided toolkit are needed to address their request.

Your response **must be a JSON array** of objects, where each item is:
- A script: { "type": "script", "name": "general_script" }
- A tool: { "type": "tool", "name": "get_training_plan", "params": { ... } }

✅ Example:
[
  { "type": "script", "name": "general_script" },
  { "type": "tool", "name": "get_training_plan", "params": { "frequency": 3 } }
]

❌ Invalid: { "tools": [...] }
❌ Invalid: ["general_script"]

You must strictly follow this JSON format.

If the required parameter is unknown (e.g. the user didn't say what the parameter is), do **not include the tool yet** — just return the script(s) and wait for more information.

Guidelines:
- Carefully read the user's message and understand the intent and emotional context.
- choose to give a user a training plan so you will need to training plan data so use get training plan, you will need the training plan script
- After selecting relevant tools, check for requiredParams.
    If any parameter is missing from the user message, **do not run the tool yet**.
    Instead, return a message that asks the user for that specific information.
- Always include "general_script" because it sets the tone for the AI in the whole app.
- DO NOT write anything except the array.

Toolkit:
${JSON.stringify(toolkit, null, 2)}

User message:
"${user_prompt}"
`;
        // 1. Tool analysis via LLM
        const analysisScript1 = `
You are a personal trainer assistant AI.
Your job is to analyze the user's message and determine which tools and scripts from the provided toolkit are needed to address their request.

Your response **must be a JSON array** of objects, where each item is:
- A script: { "type": "script", "name": "general_script" }
- A tool: { "type": "tool", "name": "get_training_plan", "params": { ... } }

✅ Example:
[
  { "type": "script", "name": "general_script" },
  { "type": "tool", "name": "get_training_plan", "params": { "frequency": 3 } }
]

❌ Invalid: { "tools": [...] }
❌ Invalid: ["general_script"]

You must strictly follow this JSON format.

If the required parameter is unknown (e.g. the user didn't say what the parameter is), do **not include the tool yet** — just return the script(s) and wait for more information.

Guidelines:
- Carefully read the user's message and understand the intent and emotional context.
- After selecting relevant tools, check for requiredParams.
    If any parameter is missing from the user message, **do not run the tool yet**.
    Instead, return a message that asks the user for that specific information.
- Pay attention to **all fields**, but especially **useCases**, when deciding what to select.
- Always include "general_script" because it sets the tone for the AI in the whole app.
- Select only the tools/scripts that are relevant.
- If none are relevant, return: ["general_script"]
- DO NOT write anything except the array.

Toolkit:
${JSON.stringify(toolkit, null, 2)}

User message:
"${user_prompt}"
`;

console.log("analysisScript: ", analysisScript)

        let toolSelectionResponse;
        if (model === 'groq') {
            toolSelectionResponse = await handleGroqRequest(analysisScript);
        } else if (model === 'ollama') {
            toolSelectionResponse = await handleOllamaRequest(analysisScript);
        } else {
            return res.status(400).json({ message: 'Invalid model selection' });
        }

        console.log('LLM tool selection response:', toolSelectionResponse);

        let selectedToolNames;
        try {
            selectedToolNames = JSON.parse(toolSelectionResponse);
        } catch (error) {
            console.error('Error parsing tool list:', error.message);
            return res.status(500).json({ message: 'Invalid tool selection format' });
        }

        // 2. Load scripts and execute tools
        const scripts = [];
        const toolOutputs = {};

        for (const item of selectedToolNames) {
            if (item.type === 'script') {
                // It's a script
                const filePath = findFileRecursively(assessmentDir, `${item.name}.json`);
                if (!filePath) throw new Error(`Script "${item.name}" not found`);
                const script = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                scripts.push(script);
            } else if (item.type === 'tool') {
                const toolName = item.name;
                const toolParams = item.params || {};
                const filePath = findFileRecursively(assessmentDir, `${item.name}.js`);
                if (!filePath) throw new Error(`Tool "${toolName}" not found`);
                const output = await runToolByName(item.name, item.params || {});
                toolOutputs[toolName] = output;
            }
        }        

        // 3. Build final prompt
        const combinedScripts = scripts.map(s => s.system_prompt).join('\n\n');
        const toolOutputText = Object.entries(toolOutputs)
            .map(([name, output]) => `Tool: ${name}\nOutput: ${output}`)
            .join('\n\n');

        const finalPrompt = `
        ${combinedScripts}

        ${toolOutputText ? `Tool outputs:\n${toolOutputText}\n\n` : ''}

        Now continue the chat with the user.
        User says:
        "${user_prompt}"

        Trainer:
        `;
        console.log("finalPrompt: ", finalPrompt)

        let finalResponse;
        if (model === 'groq') {
            finalResponse = await handleGroqRequest(finalPrompt);
        } else {
            finalResponse = await handleOllamaRequest(finalPrompt);
        }

        console.log('LLM Final Response:', finalResponse);
        res.status(200).json({ response: finalResponse });

    } catch (error) {
        console.error(`LLM route error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
