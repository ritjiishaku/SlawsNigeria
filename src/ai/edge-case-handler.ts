// Edge Case Handler - AGENTS.md Section 11
// Handle all edge cases gracefully. Never leave a user in a broken state.

import { ResponseContract } from './response-contract';

export interface EdgeCaseInput {
  case:
    | 'payment_failure'
    | 'incomplete_onboarding'
    | 'session_timeout'
    | 'missing_knowledge_base_data'
    | 'duplicate_subscription'
    | 'expired_subscription'
    | 'abusive_message'
    | 'api_error'
    | 'ndpa_consent_not_given';
  userMessage?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: any;
}

export function handleEdgeCase(input: EdgeCaseInput): ResponseContract {
  const { case: caseType, userMessage, userId, sessionId } = input;

  switch (caseType) {
    case 'payment_failure':
      return {
        message: 'Your payment could not be processed. Please try again or contact us on WhatsApp for assistance.',
        options: ['Retry Payment', 'Contact WhatsApp Support'],
        next_action: 'escalate',
        intent_detected: 'purchase_intent',
        escalate: true,
        language: 'en-NG'
      };

    case 'incomplete_onboarding':
      return {
        message: 'It looks like you didn\'t complete your registration. Let\'s pick up where you left off.',
        options: ['Continue Registration', 'Start Over'],
        next_action: 'start_onboarding',
        intent_detected: 'onboarding',
        escalate: false,
        language: 'en-NG'
      };

    case 'session_timeout':
      return {
        message: 'You\'ve been inactive for a while. Would you like to continue?',
        options: ['Yes, continue', 'Start over'],
        next_action: 'end_session',
        intent_detected: 'unclear',
        escalate: false,
        language: 'en-NG'
      };

    case 'missing_knowledge_base_data':
      return {
        message: 'I don\'t have that information at the moment. Let me connect you to Princess Ngozi for assistance.',
        options: ['Chat with Support'],
        next_action: 'escalate',
        intent_detected: 'support',
        escalate: true,
        language: 'en-NG'
      };

    case 'duplicate_subscription':
      return {
        message: 'You already have an active subscription plan. Would you like to upgrade or renew?',
        options: ['Upgrade Plan', 'Renew Subscription', 'View My Plan'],
        next_action: 'open_subscription',
        intent_detected: 'purchase_intent',
        escalate: false,
        language: 'en-NG'
      };

    case 'expired_subscription':
      return {
        message: 'Your subscription has expired. Renew now to continue enjoying full access to SlawsNigeria services.',
        options: ['Renew Now', 'View Plans'],
        next_action: 'open_subscription',
        intent_detected: 'purchase_intent',
        escalate: false,
        language: 'en-NG'
      };

    case 'abusive_message':
      return {
        message: 'Let\'s keep our conversation respectful. How can I help you with our services today?',
        options: ['View Services', 'Contact Support'],
        next_action: 'show_catalogue',
        intent_detected: 'out_of_scope',
        escalate: false,
        language: 'en-NG'
      };

    case 'api_error':
      return {
        message: 'I\'m experiencing a technical issue. Please try again or contact us on WhatsApp.',
        options: ['Try Again', 'Contact WhatsApp Support'],
        next_action: 'escalate',
        intent_detected: 'support',
        escalate: true,
        language: 'en-NG'
      };

    case 'ndpa_consent_not_given':
      return {
        message: 'Under Nigeria\'s Data Protection Act 2023, we need your consent before storing your information. Please provide your consent to continue.',
        options: ['I Consent', 'Learn More'],
        next_action: 'start_onboarding',
        intent_detected: 'onboarding',
        escalate: false,
        language: 'en-NG'
      };

    default:
      return {
        message: 'Something went wrong. Let me connect you to a human agent.',
        options: ['Contact Support'],
        next_action: 'escalate',
        intent_detected: 'support',
        escalate: true,
        language: 'en-NG'
      };
  }
}
