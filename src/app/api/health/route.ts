import { NextResponse } from 'next/server'

// Public health endpoint (no auth) for monitoring.
export async function GET() {
  return NextResponse.json({ ok: true, service: 'mission-control', ts: Date.now() })
}
