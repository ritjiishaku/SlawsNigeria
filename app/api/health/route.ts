import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: 'checking',
    services: {},
  }

  // Check Supabase connection
  try {
    const { count, error } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    checks.services.supabase = { status: 'healthy', subscriber_count: count }
  } catch (error: any) {
    checks.services.supabase = { status: 'unhealthy', error: error.message }
  }

  // Check Wati API key presence
  checks.services.wati = {
    status: process.env.WATI_API_KEY ? 'configured' : 'missing',
  }

  // Check environment variables
  checks.services.env = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    wati_key: !!process.env.WATI_API_KEY,
    admin_password: !!process.env.ADMIN_PASSWORD,
  }

  // Overall status
  const allHealthy = Object.values(checks.services).every(
    (s: any) => s.status === 'healthy' || s.status === 'configured' || s.status === true
  )
  checks.status = allHealthy ? 'healthy' : 'degraded'

  return NextResponse.json(checks)
}
