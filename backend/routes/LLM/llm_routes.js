import express from 'express';
import fs from 'fs';
import path from 'path';
import { handleGroqRequest } from '../../services/groq_service.js';
import { handleOllamaRequest } from '../../services/ollama_service.js';
import findFileRecursively from '../../utils/findFile.js';
import { runToolByName } from '../../utils/toolRunner.js';

const router = express.Router();
const assessmentDir = path.join(process.cwd(), 'LLM', 'assessment');

let cachedToolsSummary = null;
let cachedScriptsSummary = null;

export function loadSummaries() {
    const toolSummaryPath = path.join(process.cwd(), 'LLM', 'assessment', 'tools', 'toolkitSummary.json');
    const scriptSummaryPath = path.join(process.cwd(), 'LLM', 'assessment', 'scripts', 'scriptSummary.json');

    if (!cachedToolsSummary || !cachedScriptsSummary) {
        cachedToolsSummary = JSON.parse(fs.readFileSync(toolSummaryPath, 'utf-8'));
        cachedScriptsSummary = JSON.parse(fs.readFileSync(scriptSummaryPath, 'utf-8'));
        console.log('Summaries loaded into memory');
    }
}

export function getSummaries() {
    return { cachedToolsSummary, cachedScriptsSummary };
}

router.post('/message', async (req, res) => {
    const { prompt, model, style = "onBoarding" } = req.body;

    if (!prompt || !model) {
        return res.status(400).json({ message: 'Prompt and model are required' });
    }

    const user_goal = "lose weight"
    const user_prompt = prompt;
    const user_style = style

    try {
        const { cachedToolsSummary: toolsSummary, cachedScriptsSummary: scriptsSummary } = getSummaries();

        const summarizedToolkit = {
            tools: toolsSummary,
            scripts: scriptsSummary
          };

        const analysisScript = `
          You are an intelligent planning assistant for a fitness trainer AI.
          
          Your job is to:
          1. Think aloud and explain your reasoning **inside a <thinking> block**
          2. Then return the selected tools and scripts **inside an <answer> JSON array block**
          
          User goal: ${user_goal}
          User stage: ${user_style}
          Your responses must work towards this goal examples can be: suggest a training plan, explore motivation, help them with scheduling, suggest beginner actions, etc.

          🧠 What to do:
          - Analyze user intent (goal, mindset, hesitation)
          - understnad what tools and scripts you need or will need soon
          
          🛠️ When you have all required parameters for a tool, you can include it.
          If anything is missing, just ask the user — don’t call the tool yet.
          
          Respond format:
          <thinking>
          Explain what you know, what you're still missing, and why you chose each script/tool.
          </thinking>
          <answer>
          [
            { "type": "script", "name": "..." },
            { "type": "tool", "name": "...", "params": { ... } }
          ]
          </answer>
          
          Toolkit:
          ${JSON.stringify(summarizedToolkit, null, 2)}
          
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

        let reasoning = '';
        let selectedToolNames = [];
        
        try {
            const thinkingMatch = toolSelectionResponse.match(/<thinking>([\s\S]*?)<\/thinking>/i);
            const answerMatch = toolSelectionResponse.match(/<answer>([\s\S]*?)<\/answer>/i);
            if (!answerMatch) throw new Error('Missing <answer> block');
            const jsonRaw = answerMatch[1].replace(/```(?:json)?/g, '').trim();
            reasoning = thinkingMatch ? thinkingMatch[1].trim() : '[No reasoning provided]';
            selectedToolNames = JSON.parse(jsonRaw);
        
            console.log('🧠 LLM thinking:\n', reasoning);
        
        } catch (error) {
            console.error('❌ Failed to parse LLM output:', error.message);
            return res.status(500).json({ message: 'Invalid format returned from LLM' });
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
        importent instructions:
         - this is not a markdown chat this is text so do not add things like ** or ##
         - remember the goal of the conversation is ${user_goal}
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
