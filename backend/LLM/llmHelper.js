import fs from 'fs';
import path from 'path';
import { handleGroqRequest } from '../services/groq_service.js';
import { handleOllamaRequest } from '../services/ollama_service.js';
import findFileRecursively from '../utils/findFile.js';
import { runToolByName } from '../utils/toolRunner.js';
import { getMessages } from '../models/llm_models/conversations_model.js';

const assessmentDir = path.join(process.cwd(), 'LLM', 'assessment');
let cachedToolsSummary = null;
let cachedScriptsSummary = null;

export function loadSummaries() {
    const toolSummaryPath = path.join(assessmentDir, 'tools', 'toolkitSummary.json');
    const scriptSummaryPath = path.join(assessmentDir, 'scripts', 'scriptSummary.json');
    if (!cachedToolsSummary || !cachedScriptsSummary) {
        cachedToolsSummary = JSON.parse(fs.readFileSync(toolSummaryPath, 'utf-8'));
        cachedScriptsSummary = JSON.parse(fs.readFileSync(scriptSummaryPath, 'utf-8'));
    }
}

export async function runLLMFlow({ user_id, session_id, user_prompt, user_style, model }) {
    loadSummaries();
    const recentMessages = await getMessages(user_id, session_id, 10);
    const toolsSummary = cachedToolsSummary;
    const scriptsSummary = cachedScriptsSummary;

    const summarizedToolkit = { tools: toolsSummary, scripts: scriptsSummary };
    const formattedContext = recentMessages.map(msg => {
        const senderLabel = msg.role === 'user' ? 'User' : 'Trainer';
        return `${senderLabel}: ${msg.message}`;
    }).join('\n');

    console.log('==== context: ===== \n', formattedContext)

    const analysisScript = `
          You are an intelligent planning assistant for a fitness trainer AI.
          
          Your job is to:
          1. Think aloud and explain your reasoning **inside a <thinking> block**
          2. Then return the selected tools and scripts **inside an <answer> JSON array block**
          
          context for the User prompt: ${formattedContext}
          User stage: ${user_style}
          Your responses must work towards a goal thats align with the user. examples can be: suggest a training plan, explore motivation, help them with scheduling, suggest beginner actions, etc.

          🧠 What to do:
          - Analyze user intent (goal, mindset, hesitation)
          - understnad what tools and scripts you need or will need soon
          
        🛠️ When you have all required parameters for a tool, you can include it.
        - If anything is missing, just ask the user — don’t call the tool yet.
        + Only include scripts from the "scripts" list, and tools from the "tools" list. Do not confuse the two.
        + Never treat "general_script" as a tool. It is only a script.
        + Do not invent new tools or scripts.
        + Only use tools and scripts exactly as listed below. If a tool or script is missing, skip it.

          
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

    console.log("'==== analysis script: ===== \n': ", analysisScript)

    let toolSelectionResponse;
    if (model === 'groq') {
        toolSelectionResponse = await handleGroqRequest(analysisScript);
    } else if (model === 'ollama') {
        toolSelectionResponse = await handleOllamaRequest(analysisScript);
    } else {
        throw new Error('Invalid model selection');
    }

    console.log('==== Raw LLM tool selection response: ===== \n', toolSelectionResponse);

    let reasoning = '';
    let selectedToolNames = [];

    try {
        const thinkingMatch = toolSelectionResponse.match(/<thinking>([\s\S]*?)<\/thinking>/i);
        const answerMatch = toolSelectionResponse.match(/<answer>([\s\S]*?)<\/answer>/i);
        if (!answerMatch) {
            console.warn('⚠️ No <answer> block found, skipping tool/script phase.');
            return {
                trainer_reply: toolSelectionResponse.trim()  // Use raw response directly
            };
        }
        let jsonRaw = answerMatch[1].replace(/```(?:json)?/g, '').trim();
        jsonRaw = jsonRaw.replace(/,\s*]/g, ']');  // Fix: [, ] -> []
        jsonRaw = jsonRaw.replace(/,\s*}/g, '}');  // Fix: {, } -> {}
        console.log('==== Clean LLM tool selection response: ===== \n', jsonRaw);
        try {
            selectedToolNames = JSON.parse(jsonRaw);
        } catch (parseError) {
            console.error('❌ Failed JSON:', jsonRaw);
            throw new Error('Invalid JSON in <answer> block');
        }
        reasoning = thinkingMatch ? thinkingMatch[1].trim() : '[No reasoning provided]';
        selectedToolNames = JSON.parse(jsonRaw);

    } catch (error) {
        console.error('❌ Failed to parse LLM output:', error.message);
        throw new Error('Invalid format returned from LLM');
    }

    
            // 2. Load scripts and execute tools
            const scripts = [];
            const toolOutputs = {};
    
            for (const item of selectedToolNames) {
                if (item.type === 'script') {
                    // It's a script
                    const filePath = findFileRecursively(assessmentDir, `${item.name}.json`);
                    if (!filePath) {
                        console.warn(`Script "${item.name}" not found, skipping.`);
                        continue;  // Skip to next item
                    }
                    const script = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    scripts.push(script);
            
                } else if (item.type === 'tool') {
                    const toolName = item.name;
                    const toolParams = item.params || {};
                    const filePath = findFileRecursively(assessmentDir, `${toolName}.js`);
                    if (!filePath) {
                        console.warn(`Tool "${toolName}" not found, skipping.`);
                        continue;  // Skip invalid tool
                    }
                    try {
                        const output = await runToolByName(toolName, toolParams);
                        toolOutputs[toolName] = output;
                    } catch (toolError) {
                        console.error(`Error running tool "${toolName}":`, toolError.message || toolError);
                    }
                } else {
                    console.warn(`Unknown item type "${item.type}", skipping.`);
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
             - remember the context of this text is ${formattedContext}
            ${combinedScripts}
    
            ${toolOutputText ? `Tool outputs:\n${toolOutputText}\n\n` : ''}
    
            Now continue the chat with the user.
            User says:
            "${user_prompt}"
    
            Trainer:
            `;
            console.log('==== Finalpromt: ===== \n', finalPrompt)
    
            let finalResponse;
            if (model === 'groq') {
                finalResponse = await handleGroqRequest(finalPrompt);
            } else {
                finalResponse = await handleOllamaRequest(finalPrompt);
            }
    
            console.log('==== LLM response: ===== \n', finalResponse);
            return {
                trainer_reply: finalResponse.trim()
            };
    
}
