import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'slaws2026'

export async function POST(request: NextRequest) {
  try {
    const { password, message, tags, scheduled_for } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!message || !scheduled_for) {
      return NextResponse.json({ error: 'Message and scheduled_for required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('scheduled_broadcasts')
      .insert({
        message,
        tags: tags || null,
        scheduled_for: new Date(scheduled_for).toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ broadcast: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('scheduled_broadcasts')
    .select('*')
    .order('scheduled_for', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ broadcasts: data })
}
