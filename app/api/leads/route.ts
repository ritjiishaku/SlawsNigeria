import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, interest } = await request.json()

    if (!name || !phone || !interest) {
      return NextResponse.json({ error: 'Name, phone, and interest required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        phone,
        interest,
      })
      .select()
      .single()

    if (error) {
      // If duplicate phone, still return success (user already exists)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already registered' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
