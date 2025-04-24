import axios from 'axios';
import { getAppSettings } from '@/config';
import { ChatSession } from '@/types/chat';

const { URL_backend } = getAppSettings();
const API = axios.create({ baseURL: `${URL_backend}/llm/conversation` });

/** Create a new conversation */
export async function addConversation(user_id: number, session_id: string, title: string, conversation: ChatSession['messages']) {
  try {
    const response = await API.post('/', { user_id, session_id, title, conversation });
    return response.data;
  } catch (error) {
    console.error('Add Conversation Error:', error);
    throw error;
  }
}

/** Update an existing conversation */
export async function updateConversation(user_id: number, session_id: string, title: string, conversation: ChatSession['messages']) {
    try {
      const response = await API.put('/', { user_id, session_id, title, conversation });
      return response.data;
    } catch (error) {
      console.error('Update Conversation Error:', error);
      throw error;
    }
  }
  

/** Delete a conversation */
export async function deleteConversation(user_id: number, session_id: string) {
  try {
    const response = await API.delete('/', { data: { user_id, session_id } });
    return response.data;
  } catch (error) {
    console.error('Delete Conversation Error:', error);
    throw error;
  }
}

/** Get recent N conversations for a user */
export async function getRecentConversations(user_id: number, limit: number = 5) {
  try {
    const response = await API.get(`/recent/${user_id}/${limit}`);
    return response.data;
  } catch (error) {
    console.error('Get Recent Conversations Error:', error);
    throw error;
  }
}

/** Get all conversations for a user */
export async function getAllConversations(user_id: number) {
  try {
    const response = await API.get(`/all/${user_id}`);
    return response.data;
  } catch (error) {
    console.error('Get All Conversations Error:', error);
    throw error;
  }
}
