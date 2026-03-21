import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { eventBus } from '@/lib/event-bus'

export async function PUT(request: Request, ctx: { params: Promise<{ linkId: string }> }) {
  await requireRole(request, 'operator')
  const { linkId } = await ctx.params
  const id = Number(linkId)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const db = getDatabase()

  const existing = db.prepare('SELECT * FROM project_links WHERE id = ?').get(id) as any
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const type = body?.type != null ? String(body.type) : existing.type
  const label = body?.label != null ? String(body.label).trim() : existing.label
  const url = body?.url !== undefined ? (body.url == null ? null : String(body.url).trim()) : existing.url
  const localPath = body?.local_path !== undefined ? (body.local_path == null ? null : String(body.local_path).trim()) : existing.local_path

  if (!label) return NextResponse.json({ error: 'label cannot be empty' }, { status: 400 })
  if (!url && !localPath) return NextResponse.json({ error: 'either url or local_path is required' }, { status: 400 })

  db.prepare(`
    UPDATE project_links
    SET type = ?, label = ?, url = ?, local_path = ?
    WHERE id = ?
  `).run(type, label, url, localPath, id)

  const row = db.prepare('SELECT * FROM project_links WHERE id = ?').get(id)
  eventBus.emit('db_change', { type: 'project_link', action: 'update', id })
  return NextResponse.json(row)
}

export async function DELETE(request: Request, ctx: { params: Promise<{ linkId: string }> }) {
  await requireRole(request, 'admin')
  const { linkId } = await ctx.params
  const id = Number(linkId)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const db = getDatabase()
  const row = db.prepare('SELECT id, project_id, sort_order FROM project_links WHERE id = ?').get(id) as any
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 })

  db.transaction(() => {
    db.prepare('DELETE FROM project_links WHERE id = ?').run(id)
    db.prepare('UPDATE project_links SET sort_order = sort_order - 1 WHERE project_id = ? AND sort_order > ?').run(row.project_id, row.sort_order)
  })()

  eventBus.emit('db_change', { type: 'project_link', action: 'delete', id })
  return NextResponse.json({ ok: true })
}
