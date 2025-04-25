import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, AppState
} from 'react-native';
import { getAppSettings } from '@/config';
import SideMenu from '@/components/general/sideMenu';
import { createNewSession, switchSession } from '@/utils/chat_utils';
import { ChatSession, Message } from '@/types/chat';
import { SupportedModel } from '@/types/llm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/authContext';

import {
  createSession, sendMessage, getAllSessions, getSessionMessages, updateSessionTitle
} from '@/api/chatApi';

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

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const result = await getAllSessions(userId);
        let sessions: ChatSession[] = [];
  
        if (result.success && result.data.length > 0) {
          sessions = result.data.map((row: any) => ({
            sessionId: row.session_id,
            name: row.title,
            messages: [],
          }));
        }
  
        // Create a new session locally, NOT saved to backend
        const newSession = await createNewSession(userId);
        setChatSessions([newSession, ...sessions]);
        setActiveSessionId(newSession.sessionId);
  
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    };
    loadSessions();
  }, []);

  // Fetch messages for session when switching
  const loadMessagesForSession = async (sessionId: string) => {
    try {
      const result = await getSessionMessages(userId, sessionId);
      if (result.success) {
        const messages: Message[] = result.data.map((msg: any) => ({
          id: `${Date.parse(msg.send_at)}-${msg.role}`,
          text: msg.message,
          sender: msg.role,
          send_at: msg.send_at,
        }));
        setChatSessions(prev =>
          prev.map(s =>
            s.sessionId === sessionId ? { ...s, messages } : s
          )
        );
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const getCurrentSession = (): ChatSession | undefined =>
    chatSessions.find(session => session.sessionId === activeSessionId);

  const getChatNameFromLLM = async (message: string): Promise<string> => {
    if (message.length > 10) return `${message.slice(0, 10)}...`;
    return message;
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || isThinking || !activeSessionId) return;
  
    const userMessage: Message = {
      id: Date().toString(),
      text: input,
      sender: 'user',
    };
  
    setChatSessions(prev => prev.map(session =>
      session.sessionId === activeSessionId
        ? { ...session, messages: [...session.messages, userMessage, { id: 'thinking', text: 'Trainer is thinking...', sender: 'thinking' }] }
        : session
    ));
  
    setInput('');
    setIsThinking(true);
  
    // Send message to backend
    const response = await sendMessage(userId, activeSessionId, 'user', input, new Date().toLocaleString("sv-SE", { timeZone: "Asia/Jerusalem" }), getAppSettings().LLM_MODEL as SupportedModel);
  
    const trainerReply = response?.trainer_reply || 'Sorry, no reply.';
  
    // Handle sessionId change from backend
    let updatedSessionId = activeSessionId;
    if (response?.session_id && response.session_id !== activeSessionId) {
      updatedSessionId = response.session_id;
      setActiveSessionId(response.session_id);
      setChatSessions(prev => prev.map(session =>
        session.sessionId === activeSessionId
          ? { ...session, sessionId: response.session_id }
          : session
      ));
    }
  
    // Update name if needed
    const currentSession = chatSessions.find(session => session.sessionId === updatedSessionId);
    let updatedName = currentSession?.name || 'New Chat';
  
    if (response?.title && updatedName === 'New Chat') {
      updatedName = response.title;
      await updateSessionTitle(userId, updatedSessionId, updatedName);
    }
  
    // Update trainer reply
    setChatSessions(prev =>
      prev.map(session => {
        if (session.sessionId === updatedSessionId) {
          const updatedMessages: Message[] = session.messages.map(msg =>
            msg.id === 'thinking'
              ? { id: Date.now().toString(), text: trainerReply, sender: 'trainer' as 'trainer' }
              : msg
          );
          return { ...session, messages: updatedMessages, name: updatedName };
        }
        return session;
      })
    );
  
    setIsThinking(false);
  };
  

  const renderItem = ({ item }: { item: Message }) => (
    item.sender === 'thinking' ? (
      <View style={styles.thinkingBubble}><Text style={styles.thinkingText}>{item.text}</Text></View>
    ) : (
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.trainerBubble,
      ]}><Text style={styles.messageText}>{item.text}</Text></View>
    )
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })} keyboardVerticalOffset={90}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getCurrentSession()?.name || 'Chat'}</Text>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <SideMenu
            List={chatSessions.map(s => ({ Id: s.sessionId, name: s.name }))}
            onSelect={async (sessionId) => {
              setActiveSessionId(sessionId); // Immediate UI update
              setMenuVisible(false);         // Close menu fast

              if (sessionId.startsWith('new')) {
                const exists = chatSessions.find(s => s.sessionId === sessionId);
                if (!exists) {
                  const session = await createNewSession(userId);
                  setChatSessions(prev => [session, ...prev]);
                }
              } else {
                await loadMessagesForSession(sessionId);
              }
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
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type your message..." placeholderTextColor="#999" editable={!isThinking} />
          <TouchableOpacity onPress={handleSendMessage } style={[styles.sendButton, isThinking && styles.disabledButton]} disabled={isThinking}>
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
