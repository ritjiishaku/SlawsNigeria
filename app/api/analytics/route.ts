import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'slaws2026'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get total subscribers
    const { count: totalSubscribers } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })

    // Get subscribers by tag
    const { data: subscribers } = await supabase
      .from('subscribers')
      .select('interest_tags')

    const tagCounts: Record<string, number> = {}
    subscribers?.forEach(sub => {
      sub.interest_tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    // Get scheduled broadcasts count
    const { count: pendingBroadcasts } = await supabase
      .from('scheduled_broadcasts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get services count
    const { count: totalServices } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalSubscribers: totalSubscribers || 0,
      totalServices: totalServices || 0,
      pendingBroadcasts: pendingBroadcasts || 0,
      tagCounts,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
