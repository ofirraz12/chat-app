// types.ts
export type Sender = 'user' | 'trainer' | 'thinking';

export type Message = {
  id: string;
  text: string;
  sender: Sender;
};

export type ChatSession = {
  sessionId: string;
  name: string;
  messages: Message[];
};
