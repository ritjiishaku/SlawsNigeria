import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage, tagSubscriber } from '@/lib/wati'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Wati sends messages in this format
    const { waId, text, name } = body
    
    if (!waId) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    // Log the incoming message
    console.log(`Message from ${waId}: ${text}`)

    // Check if user exists in subscribers
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('*')
      .eq('phone', waId)
      .single()

    // If new user, add them
    if (!subscriber) {
      await supabase
        .from('subscribers')
        .insert({
          phone: waId,
          interest_tags: ['general'],
          subscribed_at: new Date().toISOString(),
        })
    }

    // Simple auto-response based on keywords
    let response = ''
    const lowerText = (text || '').toLowerCase()

    if (lowerText.includes('events') || lowerText.includes('event')) {
      response = 'Thanks for your interest in Events! We\'ll send you updates about upcoming events. Reply "unsubscribe" to stop messages.'
      await tagSubscriber(waId, ['events'])
    } else if (lowerText.includes('product') || lowerText.includes('store')) {
      response = 'Thanks for your interest in our Women\'s Store! We\'ll send you product updates. Reply "unsubscribe" to stop messages.'
      await tagSubscriber(waId, ['products'])
    } else if (lowerText.includes('mentor')) {
      response = 'Thanks for your interest in Mentorship! We\'ll connect you with mentors. Reply "unsubscribe" to stop messages.'
      await tagSubscriber(waId, ['mentorship'])
    } else if (lowerText.includes('unsubscribe') || lowerText.includes('stop')) {
      response = 'You\'ve been unsubscribed from SlawsNigeria updates. Message us anytime to resubscribe.'
      await supabase.from('subscribers').delete().eq('phone', waId)
    } else {
      response = 'Welcome to SlawsNigeria! 🎉\n\nReply with:\n• "events" for event updates\n• "products" for store updates\n• "mentorship" for mentorship info\n\nReply "unsubscribe" to stop messages.'
    }

    // Send auto-response via Wati
    await sendWhatsAppMessage(waId, response)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Wati webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const hubChallenge = searchParams.get('hub.challenge')
  
  if (hubChallenge) {
    return new NextResponse(hubChallenge)
  }
  
  return NextResponse.json({ status: 'Webhook endpoint active' })
}
