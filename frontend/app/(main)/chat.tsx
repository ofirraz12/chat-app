import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { sendLLMMessage } from '@/api/llmApi';
import { getAppSettings } from '@/config';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'trainer' | 'thinking';
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! How can I help you today?',
      sender: 'trainer',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (input.trim() === '' || isThinking) return;

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

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setIsThinking(true);

    const replyText = await sendLLMMessage(input, getAppSettings().LLM_MODEL);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === 'thinking'
          ? { id: Date.now().toString(), text: replyText, sender: 'trainer' }
          : msg
      )
    );

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
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item.id + index}
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
  );
};

export default Chat;


const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: '#f8f8f8',
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
