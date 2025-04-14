import express from 'express';
const router = express.Router();

import { handleGroqRequest } from '../services/groq_service.js';
import { handleOllamaRequest } from '../services/ollama_service.js';

router.post('/message', async (req, res) => {
    const { prompt, model } = req.body;

    if (!prompt || !model) {
        return res.status(400).json({ message: 'Prompt and model are required' });
    }

    try {
        let result;
        if (model === 'groq') {
            result = await handleGroqRequest(prompt);
        } else if (model === 'ollama') {
            result = await handleOllamaRequest(prompt);
        } else {
            return res.status(400).json({ message: 'Invalid model selection' });
        }

        res.status(200).json({ message: result });
    } catch (error) {
        console.error(`LLM route error: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
