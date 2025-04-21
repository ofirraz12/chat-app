import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ollama_URL = process.env.OLLAMA_URL

export async function handleOllamaRequest(prompt) {
    try {
        const response = await axios.post(
            `${ollama_URL}/chat`,
            {
                model: 'gemma3',
                stream: false,
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        let content = response.data.message.content;

        // Sanitize response if wrapped in markdown blocks like ```json ... ```
        const cleaned = content
            .replace(/^```json/, '')
            .replace(/^```/, '')
            .replace(/```$/, '')
            .trim();

        return cleaned;
        
    } catch (error) {
        console.error('Ollama service error:', error.response?.data || error.message);
        throw error;
    }
}
