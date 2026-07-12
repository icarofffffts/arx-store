import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, string> = {
    app: 'ok',
  }

  try {
    const supabase = createClient()
    const { error } = await supabase.schema('store').from('plans').select('id').limit(1)
    results.db = error ? `erro: ${error.message}` : 'ok'
  } catch (e: any) {
    results.db = `erro: ${e.message}`
  }

  return NextResponse.json(results)
}
