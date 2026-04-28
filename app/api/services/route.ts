import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'slaws2026'

export async function GET() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ services: data })
}

export async function POST(request: NextRequest) {
  const { password, ...service } = await request.json()

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('services')
    .insert({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price || 0,
      whatsapp_link: service.whatsapp_link,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ service: data })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const password = searchParams.get('password')
  const id = searchParams.get('id')

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
