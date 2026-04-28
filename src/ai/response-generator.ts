// Response Generator - AGENTS.md Sections 7, 8, 4 (Persona)
// Generates persona-driven responses based on intent

import { ResponseContract } from './response-contract';
import { classifyIntent, getActionForIntent, Intent } from './intent-classifier';
import { handleEdgeCase } from './edge-case-handler';

// Slaws Persona System Prompt (12-section prompt - abbreviated for code)
const SLAWS_PERSONA = `You are Slaws, the AI assistant for SlawsNigeria.
You help Nigerian women discover services across three pillars: Event Management, Women's Store, and Entrepreneur Hub.
You speak Nigerian English (en-NG) by default and Pidgin (pcm-NG) when detected.
You never guess data - if missing, redirect to Princess Ngozi via WhatsApp.
You enforce subscriber gating: non-subscribers see names only, subscribers see full details + pricing.
All prices are in Nigerian Naira (₦). Phone numbers are in +234 format.`;

// Subscriber gating copy (AGENTS.md Section 9)
const SUBSCRIBER_GATE_PROMPT = "This content is available to SlawsNigeria subscribers. It takes less than a minute to subscribe and unlock full access. Would you like me to show you how?";

export interface GenerateResponseInput {
  userMessage: string;
  userId?: string;
  sessionId: string;
  isSubscriber: boolean;
  language?: 'en-NG' | 'pcm-NG';
}

export function generateResponse(input: GenerateResponseInput): ResponseContract {
  const { userMessage, isSubscriber } = input;
  let { language = 'en-NG' } = input;
  
  // Simple Pidgin detection (AGENTS.md Section 8)
  const pidginKeywords = ['how far', 'how you dey', 'wetin', 'una', 'abi', 'abeg', 'waka', 'pikin'];
  if (pidginKeywords.some(kw => userMessage.toLowerCase().includes(kw))) {
    language = 'pcm-NG';
  }
  
  // Classify intent
  const classification = classifyIntent(userMessage);
  const intent = classification.intent;
  const nextAction = getActionForIntent(intent);

  // Handle out of scope
  if (intent === 'out_of_scope') {
    return {
      message: 'I\'m here to help with SlawsNigeria services: Event Management, Women\'s Store, and Entrepreneur Hub. How can I assist you with these?',
      options: ['View Services', 'Subscribe', 'Contact Support'],
      next_action: 'redirect_scope',
      intent_detected: intent,
      escalate: false,
      language
    };
  }

  // Handle discovery intent
  if (intent === 'discovery') {
    if (!isSubscriber) {
      return {
        message: `Welcome to SlawsNigeria! We operate across three pillars:\n\n• Event Management\n• Women's Store\n• Entrepreneur Hub\n\n${SUBSCRIBER_GATE_PROMPT}`,
        options: ['Subscribe Now', 'Learn More'],
        next_action: 'show_catalogue',
        intent_detected: intent,
        escalate: false,
        language
      };
    } else {
      return {
        message: 'Here are our three service pillars with full details:\n\n• **Event Management**: VIP, Standard, Professional events\n• **Women\'s Store**: Fashion, accessories, and more\n• **Entrepreneur Hub**: Mentorship, courses, consulting',
        options: ['View Events', 'Shop Now', 'Mentorship'],
        next_action: 'show_catalogue',
        intent_detected: intent,
        escalate: false,
        language
      };
    }
  }

  // Handle purchase intent
  if (intent === 'purchase_intent') {
    return {
      message: 'Choose a subscription plan that works for you (all prices in ₦):\n\n• Monthly: ₦2,500\n• Quarterly: ₦6,500\n• Annual: ₦22,000',
      options: ['Monthly ₦2,500', 'Quarterly ₦6,500', 'Annual ₦22,000'],
      next_action: 'open_subscription',
      intent_detected: intent,
      escalate: false,
      language
    };
  }

  // Default response for other intents
  return {
    message: 'How can I help you with SlawsNigeria services today?',
    options: ['View Services', 'Subscribe', 'Contact Support'],
    next_action: nextAction,
    intent_detected: intent,
    escalate: false,
    language
  };
}
