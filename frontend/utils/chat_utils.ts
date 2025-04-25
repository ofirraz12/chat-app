import { ChatSession, Message } from '@/types/chat';

export const createNewSession = async (userId: number): Promise<ChatSession> => {
  const sessionId = "new" + String(userId);
  const name = "New Chat";

  return {
    sessionId,
    name,
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
