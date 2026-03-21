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
  const rows = db.prepare('SELECT * FROM project_links WHERE project_id = ? ORDER BY sort_order ASC, id ASC').all(projectId)
  return NextResponse.json(rows)
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole(request, 'operator')
  const { id } = await ctx.params
  const projectId = Number(id)
  if (!Number.isFinite(projectId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const type = String(body?.type || 'url')
  const label = String(body?.label || '').trim()
  const url = body?.url != null ? String(body.url).trim() : null
  const localPath = body?.local_path != null ? String(body.local_path).trim() : null

  if (!label) return NextResponse.json({ error: 'label is required' }, { status: 400 })
  if (!url && !localPath) return NextResponse.json({ error: 'either url or local_path is required' }, { status: 400 })

  const db = getDatabase()
  const maxSort = (db.prepare('SELECT COALESCE(MAX(sort_order), 0) as maxSort FROM project_links WHERE project_id = ?').get(projectId) as any).maxSort as number
  const sortOrder = maxSort + 1

  const info = db.prepare(`
    INSERT INTO project_links (project_id, type, label, url, local_path, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(projectId, type, label, url, localPath, sortOrder)

  const row = db.prepare('SELECT * FROM project_links WHERE id = ?').get(info.lastInsertRowid)
  eventBus.emit('db_change', { type: 'project_link', action: 'create', id: info.lastInsertRowid, projectId })
  return NextResponse.json(row, { status: 201 })
}
