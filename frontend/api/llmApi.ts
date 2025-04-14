// llmApi.ts
import axios from 'axios';
import { getAppSettings } from '@/config';

const API = axios.create({ baseURL: getAppSettings().URL_backend });

async function sendLLMMessage(prompt: string, model: 'groq' | 'ollama') {
    try {
        const response = await API.post('/llm/message', {
            prompt,
            model,
        });

        if (response.data?.message) {
            return response.data.message;
        }

        return 'No response from trainer.';
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('LLM error:', error.response?.data.message);
        } else {
            console.error('Unknown error:', error);
        }
        return 'Sorry, something went wrong.';
    }
}

export { sendLLMMessage };
