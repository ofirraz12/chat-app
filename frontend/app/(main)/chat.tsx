import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  AppState,
  Alert
} from 'react-native';
import { sendLLMMessage } from '@/api/llmApi';
import { getAppSettings } from '@/config';
import SideMenu from '@/components/general/sideMenu';
import { createNewSession, shouldSaveChat, switchSession } from '@/utils/chat_utils';

import { ChatSession, Message } from '@/types/chat';
import { SupportedModel } from '@/types/llm';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAllConversations, updateConversation, addConversation } from '@/api/chatApi';
import { useAuth } from '@/context/authContext';

const Chat = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  if (!user || !user.id) return null;
  const userId = user.id;

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const result = await getAllConversations(userId);
  
        if (result.success && result.data.length > 0) {
          // Map DB rows to ChatSession objects
          const sessions: ChatSession[] = result.data.map((row: any) => ({
            sessionId: row.session_id,
            name: row.title,
            messages: row.conversation.map((msg: any) => ({
              id: `${Date.parse(msg.send_at)}-${msg.role}`, // create a unique ID
              text: msg.message,
              sender: msg.role === 'user' ? 'user' : 'trainer',
              send_at: msg.send_at, // optional if you want to use it
            })),
          }));
  
          // Always create a new session FIRST
          const newSession = createNewSession(sessions.length);
          setChatSessions([newSession, ...sessions]);
          setActiveSessionId(newSession.sessionId); // Always start fresh
        } else {
          // No old chats? Just create a new one
          const newSession = createNewSession(0);
          setChatSessions([newSession]);
          setActiveSessionId(newSession.sessionId);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };
  
    loadConversations();
  }, []);
  
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        const currentSession = chatSessions.find(s => s.sessionId === activeSessionId);
        if (currentSession) {
          await saveChatToBackend(currentSession);
        }
      }
    };
  
    const subscription = AppState.addEventListener('change', handleAppStateChange);
  
    return () => {
      subscription.remove();
    };
  }, [chatSessions, activeSessionId]);

  const getCurrentSession = (): ChatSession | undefined =>
    chatSessions.find(session => session.sessionId === activeSessionId);

  const saveChatToBackend = async (session: ChatSession) => {
    try {
      if (session.name === 'New Chat') {
        // First-time save
        await addConversation(userId, session.sessionId, session.name, session.messages);
      } else {
        // Existing session update
        await updateConversation(userId, session.sessionId, session.name, session.messages);
      }
      console.log(`Saved session ${session.sessionId}`);
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };
  

  const getChatNameFromLLM = async (message: string): Promise<string> => {
    // For now, simulate with a simple logic.
    // Replace with your LLM integration later.
    if (message.length > 10){
      return `${message.slice(0, 10)}...`;  
    }
    return message;
  };

  const sendMessage = async () => {
    if (input.trim() === '' || isThinking || !activeSessionId) return;
  
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
  
    const thinkingMessage: Message = {
      id: 'thinking',
      text: 'Trainer is thinking...',
      sender: 'thinking',
    };
  
    // Add user + thinking
    setChatSessions(prevSessions =>
      prevSessions.map(session =>
        session.sessionId === activeSessionId
          ? { ...session, messages: [...session.messages, userMessage, thinkingMessage] }
          : session
      )
    );
  
    setInput('');
    setIsThinking(true);
  
    const replyText = await sendLLMMessage(input, getAppSettings().LLM_MODEL as SupportedModel);
  
    const currentSession = chatSessions.find(s => s.sessionId === activeSessionId);
    let updatedName = currentSession?.name || 'New Chat';
  
    if (updatedName === 'New Chat') {
      updatedName = await getChatNameFromLLM(input);
    }
  
    let updatedSession: ChatSession | undefined;
  
    setChatSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.sessionId === activeSessionId) {
          const updatedMessages: Message[] = session.messages.map((msg): Message =>
            msg.id === 'thinking'
              ? { id: Date.now().toString(), text: replyText, sender: 'trainer' }
              : msg
          );
  
          const updated: ChatSession = {
            ...session,
            messages: updatedMessages,
            name: updatedName,
          };
  
          updatedSession = updated;
          return updated;
        }
        return session;
      });
    });
  
    setIsThinking(false);
  };
  
  

  const renderItem = ({ item }: { item: Message }) => (
    item.sender === 'thinking' ? (
      <View style={styles.thinkingBubble}>
        <Text style={styles.thinkingText}>{item.text}</Text>
      </View>
    ) : (
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.trainerBubble,
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    )
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={90}
      >
        {/* Header with chat session name */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {getCurrentSession()?.name || 'Chat'}
          </Text>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <SideMenu
            List={chatSessions.map(s => ({ Id: s.sessionId, name: s.name }))}
            onSelect={async (sessionId) => {
              const currentSession = chatSessions.find(s => s.sessionId === activeSessionId);
              if (currentSession && shouldSaveChat(currentSession)) {
                await saveChatToBackend(currentSession);
              }
            
              const session = switchSession(sessionId, chatSessions);
              setActiveSessionId(session.sessionId);
              setMenuVisible(false);
            }}
            onClose={() => setMenuVisible(false)}
            setMenuVisible={setMenuVisible}
          />
        )}

        <FlatList
          ref={flatListRef}
          data={getCurrentSession()?.messages || []}
          keyExtractor={(item, index) => `${item.id || index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            editable={!isThinking}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, isThinking && styles.disabledButton]}
            disabled={isThinking}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 50,
    backgroundColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    position: 'absolute',
    right: 16,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#333',
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007aff',
  },
  trainerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#34eb80',
  },
  messageText: {
    color: '#fff',
  },
  thinkingBubble: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  thinkingText: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
