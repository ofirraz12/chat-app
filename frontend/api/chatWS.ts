import { getAppSettings } from '@/config';

const createChatWebSocket = () => {
  let socket: WebSocket | null = null;
  const url = getAppSettings().WS_URL_backend;
  const eventHandlers: Record<string, ((data: any) => void)[]> = {};
  let pendingMessage: any = null;

  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      emitEvent('open', null);

      if (pendingMessage) {
        console.log('Sending pending message after reconnect...');
        sendMessage(pendingMessage);
        pendingMessage = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        emitEvent(type, data);
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      emitEvent('error', error);
    };

    socket.onclose = () => {
      console.warn('WebSocket connection closed');
      emitEvent('close', null);
    };
  };

  const sendMessage = (message: {
    user_id: number,
    session_id: string,
    role: 'user' | 'trainer',
    message: string,
    send_at: string,
    model: 'groq' | 'ollama'
  }) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not open, storing pending message and reconnecting...');
      pendingMessage = message;
      if (!isConnected()) {
        connect();
      }
    }
  };

  const isConnected = () => socket && socket.readyState === WebSocket.OPEN;

  const on = (eventType: string, handler: (data: any) => void) => {
    if (!eventHandlers[eventType]) {
      eventHandlers[eventType] = [];
    }
    eventHandlers[eventType].push(handler);
  };

  const off = (eventType: string, handler: (data: any) => void) => {
    if (!eventHandlers[eventType]) return;
    eventHandlers[eventType] = eventHandlers[eventType].filter(h => h !== handler);
  };

  const emitEvent = (eventType: string, data: any) => {
    const handlers = eventHandlers[eventType];
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  };

  const close = () => {
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return {
    connect,
    sendMessage,
    isConnected,
    on,
    off,
    close,
  };
};

export const chatWS = createChatWebSocket();
