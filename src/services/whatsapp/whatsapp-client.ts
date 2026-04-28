// WhatsApp Client - AGENTS.md Rule 1 (Automation is P0 Launch Blocker)
// Implements WhatsApp Business API integration

import axios from 'axios';

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_API_VERSION = 'v19.0';

// Base URL for WhatsApp Cloud API
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}`;

// Headers for API requests
const headers = {
  Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

export interface SendMessageOptions {
  to: string; // Must be in +234XXXXXXXXXX format
  message: string;
  messageId?: string; // For reply context
}

export interface SendTemplateOptions {
  to: string; // +234XXXXXXXXXX format
  templateName: string;
  languageCode: string; // e.g., 'en' or 'pcm'
  components?: any[]; // Template parameters
}

// Send a text message (AGENTS.md - WhatsApp notifications)
export async function sendMessage({ to, message, messageId }: SendMessageOptions): Promise<string> {
  try {
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: message },
    };

    // Add reply context if messageId provided
    if (messageId) {
      payload.context = { message_id: messageId };
    }

    const response = await axios.post(`${WHATSAPP_API_URL}/messages`, payload, { headers });

    return response.data.messages[0].id;
  } catch (error: any) {
    console.error('WhatsApp send error:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
}

// Send template message (for notifications - AGENTS.md Section 10)
export async function sendTemplateMessage({
  to,
  templateName,
  languageCode,
  components,
}: SendTemplateOptions): Promise<string> {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: components || [],
      },
    };

    const response = await axios.post(`${WHATSAPP_API_URL}/messages`, payload, { headers });

    return response.data.messages[0].id;
  } catch (error: any) {
    console.error('WhatsApp template error:', error.response?.data || error.message);
    throw new Error('Failed to send template message');
  }
}

// Send payment confirmation (AGENTS.md Section 10, Step 3A)
export async function sendPaymentConfirmation(
  to: string,
  amount: number,
  plan: string,
  reference: string
): Promise<void> {
  const message = `✅ Payment Successful!\n\nThank you for subscribing to SlawsNigeria ${plan} plan.\nAmount: ₦${amount.toLocaleString()}\nReference: ${reference}\n\nYou now have full access to all services.`;
  
  await sendMessage({ to, message });
}

// Send escalation notification to Princess Ngozi (AGENTS.md Section 3 Escalation flow)
export async function sendEscalationNotification(
  userPhone: string,
  userName: string,
  userMessage: string,
  sessionId: string
): Promise<void> {
  const PRINCESS_PHONE = '+23481058478551';
  
  const message = `🔔 Escalation Alert\n\nUser: ${userName} (${userPhone})\nSession: ${sessionId}\n\nMessage: "${userMessage}"\n\nPlease assist this user.`;
  
  await sendMessage({ to: PRINCESS_PHONE, message });
}

// Send re-engagement prompt (AGENTS.md Section 11 - Session timeout)
export async function sendReengagementPrompt(to: string): Promise<void> {
  const message = `Hi there! We noticed you've been inactive. Would you like to continue where you left off?\n\nReply "YES" to continue or "START OVER" for a fresh start.`;
  
  await sendMessage({ to, message });
}

// Send subscription renewal reminder (AGENTS.md Section 10, Step 4)
export async function sendRenewalReminder(to: string, plan: string, endDate: Date): Promise<void> {
  const formattedDate = endDate.toLocaleDateString('en-NG');
  const message = `⏰ Subscription Renewal Reminder\n\nYour ${plan} plan will expire on ${formattedDate}.\n\nRenew now to continue enjoying full access to SlawsNigeria services.`;
  
  await sendMessage({ to, message });
}

// Verify webhook signature (AGENTS.md Skill - Security)
export function verifySignature(signature: string, body: string): boolean {
  const crypto = require('crypto');
  const appSecret = process.env.WHATSAPP_APP_SECRET || '';
  
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(body);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;
  
  return signature === expectedSignature;
}

// Parse webhook payload (AGENTS.md Skill - Inbound Webhook)
export function parseWebhook(payload: any): {
  messageId: string;
  from: string; // +234XXXXXXXXXX
  text: string;
  timestamp: string;
} | null {
  try {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return null;
    }

    return {
      messageId: message.id,
      from: message.from,
      text: message.text.body,
      timestamp: message.timestamp,
    };
  } catch (error) {
    console.error('Webhook parse error:', error);
    return null;
  }
}
