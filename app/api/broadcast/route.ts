import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/wati'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'slaws2026'

export async function POST(request: NextRequest) {
  try {
    const { password, message, tags } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Fetch subscribers (optionally filter by tags)
    let query = supabase.from('subscribers').select('phone, interest_tags')
    
    if (tags && tags.length > 0) {
      // Filter by tags (PostgreSQL array overlap)
      query = query.overlaps('interest_tags', tags)
    }

    const { data: subscribers, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 404 })
    }

    // Send message to all subscribers via Wati
    let sentCount = 0
    let failedCount = 0

    for (const subscriber of subscribers) {
      try {
        await sendWhatsAppMessage(subscriber.phone, message)
        sentCount++
        // Rate limiting: Wati allows ~10-20 messages per second
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        failedCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
