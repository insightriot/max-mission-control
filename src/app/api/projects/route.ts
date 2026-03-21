import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { eventBus } from '@/lib/event-bus'

// Projects are globally force-ranked: priority_rank is unique and contiguous (1..N)

export async function GET(request: Request) {
  await requireRole(request, 'viewer')

  const db = getDatabase()
  const url = new URL(request.url)

  const status = url.searchParams.get('status')
  const owner = url.searchParams.get('owner')
  const sprint = url.searchParams.get('sprint')
  const q = url.searchParams.get('q')

  const where: string[] = []
  const params: any[] = []

  if (status) {
    where.push('p.status = ?')
    params.push(status)
  }
  if (owner) {
    where.push('p.owner = ?')
    params.push(owner)
  }
  if (sprint) {
    where.push('p.sprint = ?')
    params.push(sprint)
  }
  if (q) {
    where.push('(p.name LIKE ? OR p.purpose LIKE ? OR p.notes LIKE ?)')
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }

  const sql = `
    SELECT p.*,
           COALESCE((SELECT COUNT(*) FROM project_links pl WHERE pl.project_id = p.id), 0) AS link_count
    FROM projects p
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY p.priority_rank ASC
  `

  const rows = db.prepare(sql).all(...params)
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  await requireRole(request, 'operator')

  const db = getDatabase()
  const body = await request.json()

  const name = String(body?.name || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const slug = String(body?.slug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') ||
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const purpose = body?.purpose != null ? String(body.purpose) : null
  const notes = body?.notes != null ? String(body.notes) : null
  const owner = body?.owner != null ? String(body.owner) : null
  const sprint = body?.sprint != null ? String(body.sprint) : null
  const status = body?.status != null ? String(body.status) : 'active'

  // Insert at bottom of stack: rank = max+1
  const maxRank = (db.prepare('SELECT COALESCE(MAX(priority_rank), 0) as maxRank FROM projects').get() as any)
    .maxRank as number
  const priorityRank = maxRank + 1

  const insert = db.prepare(`
    INSERT INTO projects (slug, name, purpose, notes, status, owner, sprint, priority_rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const info = insert.run(slug, name, purpose, notes, status, owner, sprint, priorityRank)
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid)

  eventBus.emit('db_change', { type: 'project', action: 'create', id: info.lastInsertRowid })

  return NextResponse.json(row, { status: 201 })
}
