import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// GET /api/projects/:id/tasks
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireRole(request, 'viewer')
  const { id } = await ctx.params
  const projectId = Number(id)
  if (!Number.isFinite(projectId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

  const db = getDatabase()
  const rows = db
    .prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId)
    .map((t: any) => ({
      ...t,
      tags: t.tags ? JSON.parse(t.tags) : [],
      metadata: t.metadata ? JSON.parse(t.metadata) : {},
    }))

  return NextResponse.json({ tasks: rows })
}
