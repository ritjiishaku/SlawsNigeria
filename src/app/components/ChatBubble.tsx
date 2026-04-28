// Chat Bubble Component - AGENTS.md Design System
// Royal Purple for user, Warm Cream for Slaws

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  options?: string[];
  onOptionPress?: (option: string) => void;
  timestamp?: Date;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  options,
  onOptionPress,
  timestamp
}) => {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.slawsContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.slawsBubble
      ]}>
        <Text style={[
          styles.message,
          isUser ? styles.userText : styles.slawsText
        ]}>
          {message}
        </Text>
        
        {timestamp && (
          <Text style={styles.timestamp}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
      
      {/* Quick reply options (AGENTS.md Section 8) */}
      {!isUser && options && options.length > 0 && (
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <View key={index} style={styles.optionButton}>
              <Text
                style={styles.optionText}
                onPress={() => onOptionPress?.(option)}
              >
                {option}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  slawsContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.userBubble, // Royal Purple
    borderBottomRightRadius: 4,
  },
  slawsBubble: {
    backgroundColor: colors.slawsBubble, // Warm Cream
    borderBottomLeftRadius: 4,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
    fontFamily: 'Roboto-Regular',
  },
  slawsText: {
    color: colors.gray900,
    fontFamily: 'Roboto-Regular',
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray400,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginLeft: 16,
  },
  optionButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionText: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
});

export default ChatBubble;
