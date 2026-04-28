// Intent Classifier - AGENTS.md Section 7 (Intent → Action Mapping)
// Maps user input to 9 core intents

import { ResponseContract } from './response-contract';
import { handleEdgeCase, EdgeCaseInput } from './edge-case-handler';

export type Intent =
  | 'discovery'
  | 'product_enquiry'
  | 'purchase_intent'
  | 'onboarding'
  | 'event_enquiry'
  | 'volunteer_enquiry'
  | 'support'
  | 'unclear'
  | 'out_of_scope';

export interface IntentClassification {
  intent: Intent;
  confidence: number; // 0.0 to 1.0
}

// Keywords for each intent (can be enhanced with ML model)
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  discovery: ['what do you do', 'services', 'pillars', 'what is slaws', 'who are you', 'help'],
  product_enquiry: ['product', 'service', 'store', 'buy', 'price', 'cost', 'how much', 'mentorship', 'course'],
  purchase_intent: ['subscribe', 'subscription', 'pay', 'plan', 'billing', 'checkout'],
  onboarding: ['register', 'sign up', 'create account', 'join', 'get started'],
  event_enquiry: ['event', 'workshop', 'seminar', 'vip', 'professional', 'booking', 'ticket'],
  volunteer_enquiry: ['volunteer', 'help out', 'give back', 'community service', 'join team'],
  support: ['problem', 'issue', 'help me', 'not working', 'question', 'talk to human'],
  unclear: ['hmm', 'okay', 'thanks', 'thank you', 'bye', 'goodbye'],
  out_of_scope: ['weather', 'news', 'politics', 'sports', 'entertainment']
};

export function classifyIntent(userMessage: string): IntentClassification {
  const lowerMessage = userMessage.toLowerCase();
  let bestMatch: Intent = 'unclear';
  let highestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        score += 1;
      }
    }
    
    // Normalize score
    const normalizedScore = score / keywords.length;
    
    if (normalizedScore > highestScore) {
      highestScore = normalizedScore;
      bestMatch = intent as Intent;
    }
  }

  // If no good match found, classify as unclear
  if (highestScore === 0) {
    bestMatch = 'unclear';
  }

  return {
    intent: bestMatch,
    confidence: highestScore
  };
}

// Get action based on intent (AGENTS.md Section 7)
export function getActionForIntent(intent: Intent): string {
  const intentActionMap: Record<Intent, string> = {
    discovery: 'show_catalogue',
    product_enquiry: 'show_catalogue',
    purchase_intent: 'open_subscription',
    onboarding: 'start_onboarding',
    event_enquiry: 'show_events',
    volunteer_enquiry: 'volunteer_signup',
    support: 'escalate',
    unclear: 'show_catalogue',
    out_of_scope: 'redirect_scope'
  };

  return intentActionMap[intent];
}
