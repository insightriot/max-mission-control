import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { eventBus } from '@/lib/event-bus'

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole(request, 'viewer')
  const { id } = await ctx.params
  const projectId = Number(id)
  if (!Number.isFinite(projectId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const db = getDatabase()
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId)
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(row)
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole(request, 'operator')
  const { id } = await ctx.params
  const projectId = Number(id)
  if (!Number.isFinite(projectId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const db = getDatabase()

  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const name = body?.name != null ? String(body.name).trim() : existing.name
  const slug = body?.slug != null ? String(body.slug).trim() : existing.slug
  const purpose = body?.purpose != null ? String(body.purpose) : existing.purpose
  const notes = body?.notes != null ? String(body.notes) : existing.notes
  const status = body?.status != null ? String(body.status) : existing.status
  const owner = body?.owner != null ? String(body.owner) : existing.owner
  const sprint = body?.sprint != null ? String(body.sprint) : existing.sprint

  if (!name) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })

  db.prepare(`
    UPDATE projects
    SET slug = ?, name = ?, purpose = ?, notes = ?, status = ?, owner = ?, sprint = ?, updated_at = unixepoch()
    WHERE id = ?
  `).run(slug, name, purpose, notes, status, owner, sprint, projectId)

  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId)
  eventBus.emit('db_change', { type: 'project', action: 'update', id: projectId })
  return NextResponse.json(row)
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole(request, 'admin')
  const { id } = await ctx.params
  const projectId = Number(id)
  if (!Number.isFinite(projectId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const db = getDatabase()

  const row = db.prepare('SELECT id, priority_rank FROM projects WHERE id = ?').get(projectId) as any
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const rank = row.priority_rank as number

  db.transaction(() => {
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId)
    // collapse ranks above deleted rank
    db.prepare('UPDATE projects SET priority_rank = priority_rank - 1, updated_at = unixepoch() WHERE priority_rank > ?').run(rank)
  })()

  eventBus.emit('db_change', { type: 'project', action: 'delete', id: projectId })
  return NextResponse.json({ ok: true })
}
