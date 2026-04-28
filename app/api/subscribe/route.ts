import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone, interest_tags } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('subscribers')
      .upsert(
        {
          phone,
          interest_tags: interest_tags || ['general'],
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: 'phone' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, subscriber: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
