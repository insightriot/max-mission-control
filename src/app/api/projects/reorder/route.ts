import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { eventBus } from '@/lib/event-bus'

// POST /api/projects/reorder
// Body: { ids: number[] } in desired order (top -> bottom)
export async function POST(request: Request) {
  await requireRole(request, 'operator')

  const body = await request.json().catch(() => null)
  const ids = Array.isArray(body?.ids) ? body.ids : null

  if (!ids || !ids.length || !ids.every((x: any) => Number.isInteger(x) || (typeof x === 'string' && /^\d+$/.test(x)))) {
    return NextResponse.json({ error: 'ids must be a non-empty array of project ids' }, { status: 400 })
  }

  const normalizedIds = ids.map((x: any) => Number(x))
  const unique = new Set(normalizedIds)
  if (unique.size !== normalizedIds.length) {
    return NextResponse.json({ error: 'ids must be unique' }, { status: 400 })
  }

  const db = getDatabase()

  // Ensure ids match existing projects
  const existing = db
    .prepare(`SELECT id FROM projects WHERE id IN (${normalizedIds.map(() => '?').join(',')})`)
    .all(...normalizedIds)
    .map((r: any) => r.id)

  if (existing.length !== normalizedIds.length) {
    return NextResponse.json({ error: 'one or more ids do not exist' }, { status: 400 })
  }

  const update = db.prepare('UPDATE projects SET priority_rank = ?, updated_at = unixepoch() WHERE id = ?')

  db.transaction(() => {
    // assign contiguous ranks 1..N
    for (let i = 0; i < normalizedIds.length; i++) {
      update.run(i + 1, normalizedIds[i])
    }
  })()

  eventBus.emit('db_change', { type: 'project', action: 'reorder' })

  return NextResponse.json({ ok: true })
}
