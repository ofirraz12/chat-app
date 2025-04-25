import { processUserMessage } from '../../utils/ChatUtils/processUserMessage.js';

export function setupWebSocketConnection(ws) {
    ws.on('message', async (messageData) => {
        try {
            const messageObj = JSON.parse(messageData.toString());
            const response = await processUserMessage(messageObj);
            ws.send(JSON.stringify({ type: 'reply', data: response }));
        } catch (error) {
            console.error('WebSocket message processing error:', error.message);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
}
