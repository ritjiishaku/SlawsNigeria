// Chat Screen - Slaws AI Interface
// Implements AGENTS.md Section 8 (Response Contract) and persona

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ChatBubble from '../components/ChatBubble';
import { colors, typography, spacing } from '../theme/tokens';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  options?: string[];
  next_action?: string;
  intent_detected?: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  options?: string[] | null;
  next_action: string;
  intent_detected: string;
  escalate: boolean;
  language: 'en-NG' | 'pcm-NG';
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Slaws, your AI assistant for SlawsNigeria. How can I help you today?",
      isUser: false,
      options: ['View Services', 'Subscribe', 'Contact Support'],
      next_action: 'show_catalogue',
      intent_detected: 'discovery',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      // Call Slaws API (implements AGENTS.md Section 8 Response Contract)
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          sessionId,
          userId: 'temp_user_id', // TODO: get from auth context
        }),
      });

      const data: ChatResponse = await response.json();

      const slawsMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        options: data.options || undefined,
        next_action: data.next_action,
        intent_detected: data.intent_detected,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, slawsMessage]);

      // Handle escalation (AGENTS.md Section 7)
      if (data.escalate) {
        console.log('Escalating to WhatsApp: +23481058478551');
        // TODO: Open WhatsApp
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m experiencing a technical issue. Please try again or contact us on WhatsApp.',
        isUser: false,
        options: ['Try Again', 'Contact WhatsApp Support'],
        next_action: 'escalate',
        intent_detected: 'support',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleOptionPress = (option: string) => {
    setInputText(option);
    sendMessage();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble
      message={item.text}
      isUser={item.isUser}
      options={item.options}
      onOptionPress={handleOptionPress}
      timestamp={item.timestamp}
    />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header with Slaws branding (Poppins font) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Slaws AI Assistant</Text>
        <Text style={styles.headerSubtitle}>SlawsNigeria</Text>
      </View>

      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={colors.gray400}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary, // Royal Purple
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['4'],
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.brand, // Poppins for brand
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular, // Roboto for UI
    color: colors.white,
    opacity: 0.8,
  },
  messagesContainer: {
    paddingVertical: spacing['4'],
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing['4'],
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.gray900,
  },
  sendButton: {
    marginLeft: spacing['2'],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
});

export default ChatScreen;
