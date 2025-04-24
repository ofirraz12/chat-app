// chat_utils.ts
import { ChatSession, Message } from '@/types/chat';

export const createNewSession = (sessionCount: number): ChatSession => {
  const sessionId = Date.now().toString();
  return {
    sessionId,
    name: "New Chat",
    messages: [{
      id: '1',
      text: 'Hi! How can I help you today?',
      sender: 'trainer',
    }],
  };
};

export const switchSession = (sessionId: string, sessions: ChatSession[]): ChatSession => {
  const session = sessions.find(s => s.sessionId === sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  return session;
};

export const shouldSaveChat = (session: ChatSession): boolean => {
  const hasUserMessages = session.messages.some(m => m.sender === 'user' && m.text.trim() !== '');
  const hasCustomName = session.name !== 'New Chat';

  return hasUserMessages && hasCustomName;
};
