// llmApi.ts
import axios from 'axios';
import { getAppSettings } from '@/config';
import {SupportedModel} from '@/types/llm' 
const { URL_backend} = getAppSettings();

const API = axios.create({ baseURL: `${URL_backend}/llm` });

async function sendLLMMessage(prompt: string, model: SupportedModel) {
    try {
        console.log("sending: ", model, prompt)
        const response = await API.post('/message', {
            prompt,
            model,
        });
        if (response?.data?.response) {
            return response.data.response;
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
