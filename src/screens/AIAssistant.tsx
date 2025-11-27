import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Bot, User as UserIcon } from 'lucide-react-native';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'assistant',
    content:
      "Hi! I'm your Energy AI Assistant. I can help you understand your consumption patterns, suggest ways to save energy, and answer questions about your token rewards. How can I help you today?",
    timestamp: new Date(),
  },
];

const quickActions = [
  'How can I save energy?',
  'Explain my token rewards',
  'Tips for staying below threshold',
  'Best time to use appliances',
];

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'assistant',
        content: getAIResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('save') || lowerMessage.includes('energy')) {
      return "Here are some top tips to save energy:\n\n1. Use appliances during off-peak hours (10 PM - 6 AM) for lower rates\n2. Set your thermostat 2-3 degrees lower in winter, higher in summer\n3. Unplug devices when not in use\n4. Use LED bulbs - they use 75% less energy\n5. Run full loads in dishwasher and washing machine\n\nThese changes can help you stay below your daily threshold and earn more tokens!";
    }

    if (lowerMessage.includes('token') || lowerMessage.includes('reward')) {
      return "Token rewards explained:\n\n✅ Stay below daily threshold: Earn 15-20 tokens\n✅ Off-peak usage bonus: Earn 10-15 tokens\n✅ Weekly streak: Earn 20-30 tokens\n✅ Referral bonus: Earn 50 tokens per friend\n\n❌ Above threshold: Lose 8-10 tokens\n\nYou can spend tokens on partner offers, transfer them to friends, or use them to offset bill penalties!";
    }

    if (lowerMessage.includes('threshold')) {
      return "To stay below your daily threshold:\n\n📊 Your current threshold: 30 kWh/day\n📉 Today's usage: 28.5 kWh\n\nTips:\n• Avoid running multiple high-power appliances simultaneously\n• Schedule laundry and dishwasher for off-peak hours\n• Check your dashboard regularly to monitor progress\n• Set up notifications when you reach 80% of threshold\n\nYou're doing great - only 1.5 kWh away from earning today's tokens!";
    }

    if (lowerMessage.includes('appliance') || lowerMessage.includes('time')) {
      return "Best times to use appliances for maximum savings:\n\n🌙 Off-Peak (10 PM - 6 AM): Lowest rates\n• Washing machine & dryer\n• Dishwasher\n• Electric car charging\n• Water heater (if programmable)\n\n☀️ Mid-Day (11 AM - 3 PM): Moderate rates\n• Quick loads when needed\n\n⚡ Peak (4 PM - 9 PM): Highest rates - AVOID\n• Wait until after 9 PM for heavy appliances\n\nShifting just one load per day to off-peak can save you $20-30/month!";
    }

    return "I understand you're asking about energy management. I can help with:\n\n• Understanding your consumption patterns\n• Tips for reducing energy use\n• Explaining token rewards\n• Best times to use appliances\n• Strategies to stay below threshold\n\nWhat specific aspect would you like to know more about?";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerIcon}>
          <Bot color="#3b82f6" size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>AI Energy Assistant</Text>
          <Text style={styles.headerSubtitle}>Always here to help</Text>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.type === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper,
            ]}
          >
            {message.type === 'assistant' && (
              <View style={styles.messageAvatar}>
                <Bot color="#3b82f6" size={20} />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.assistantMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View>
            {message.type === 'user' && (
              <View style={styles.messageAvatar}>
                <UserIcon color="#ffffff" size={20} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickActionButton}
              onPress={() => handleQuickAction(action)}
            >
              <Text style={styles.quickActionText}>{action}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything about energy..."
          placeholderTextColor="#6b7280"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={inputText.trim() === ''}
        >
          <Send color="#ffffff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    backgroundColor: '#1f2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  assistantMessageText: {
    color: '#e5e7eb',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  quickActionButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 16,
    color: '#ffffff',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1f2937',
    opacity: 0.5,
  },
});
