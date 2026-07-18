import { NextResponse } from 'next/server'

export function GET(request: Request) {
  const secret = request.headers.get('x-internal-secret');
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(
    { status: 'ok', timestamp: Date.now() },
    { status: 200 }
  )
}
