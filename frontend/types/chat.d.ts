export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'trainer' | 'thinking';
  send_at?: string;
}


export type ChatSession = {
  sessionId: string;
  name: string;
  messages: Message[];
};
