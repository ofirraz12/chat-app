import { processUserMessage } from '../../utils/ChatUtils/processUserMessage.js';

export function setupWebSocketConnection(ws) {
    ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          const result = await processUserMessage(data);
          ws.send(JSON.stringify({ type: 'reply', data: result }));
        } catch (error) {
          console.error('WebSocket message processing error:', error.message || error);
          ws.send(JSON.stringify({ type: 'error', message: error.message || 'Unknown error' }));
        }
      });
      

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
}
