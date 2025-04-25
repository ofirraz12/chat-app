import axios from 'axios';
import { getAppSettings } from '@/config';
import { ChatSession, Message } from '@/types/chat';

const { URL_backend } = getAppSettings();
const API = axios.create({ baseURL: `${URL_backend}/llm/conversation` });

/** Create a new session (without messages) */
export async function createSession(user_id: number, session_id: string, title: string) {
  try {
    const response = await API.post('/session', { user_id, session_id, title });
    return response.data;
  } catch (error) {
    console.error('Create Session Error:', error);
    throw error;
  }
}

/** Save one message at a time */
export async function sendMessage(user_id: number, session_id: string, role: string, message: string, send_at: string, model: 'groq' | 'ollama' = 'groq') {
  try {
    const response = await API.post('/message', { user_id, session_id, role, message, send_at, model });
    return response.data;
  } catch (error) {
    console.error('Save Message Error:', error);
    throw error;
  }
}

/** Update the session's title */
export async function updateSessionTitle(user_id: number, session_id: string, title: string) {
  try {
    const response = await API.put('/session', { user_id, session_id, title });
    return response.data;
  } catch (error) {
    console.error('Update Session Title Error:', error);
    throw error;
  }
}

/** Fetch N latest messages for context */
export async function getRecentMessages(user_id: number, session_id: string, limit: number = 20) {
  try {
    const response = await API.get(`/message/${user_id}/${session_id}/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get Recent Messages Error:', error);
    throw error;
  }
}

/** Fetch session */
export async function getSessionMessages(user_id: number, session_id: string) {
  try {
    const response = await API.get(`/session/${user_id}/${session_id}`);
    return response.data;
  } catch (error) {
    console.error('Get Session Messages Error:', error);
    throw error;
  }
}

/** Fetch all session headers (titles) */
export async function getAllSessions(user_id: number) {
  try {
    const response = await API.get(`/sessions/${user_id}`);
    return response.data;
  } catch (error) {
    console.error('Get All Sessions Error:', error);
    throw error;
  }
}
