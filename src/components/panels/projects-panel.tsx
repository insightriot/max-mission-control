'use client'

import { useEffect, useMemo, useState } from 'react'

type ProjectStatus = 'active' | 'paused' | 'parked' | 'killed' | 'legacy'

type Project = {
  id: number
  slug: string
  name: string
  purpose?: string | null
  notes?: string | null
  status: ProjectStatus
  owner?: string | null
  sprint?: string | null
  priority_rank: number
  created_at: number
  updated_at: number
  link_count?: number
}

type ProjectLink = {
  id: number
  project_id: number
  type: string
  label: string
  url?: string | null
  local_path?: string | null
  sort_order: number
  created_at: number
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function ProjectsPanel() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<Project | null>(null)
  const [links, setLinks] = useState<ProjectLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('')

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load projects')
      setProjects(data)
      // keep selection in sync
      if (selected) {
        const next = data.find((p: Project) => p.id === selected.id) || null
        setSelected(next)
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  useEffect(() => {
    if (!selected) {
      setLinks([])
      return
    }
    fetch(`/api/projects/${selected.id}/links`)
      .then(r => r.json().then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) return
        setLinks(j)
      })
      .catch(() => {})
  }, [selected])

  const statusBadge = (status: ProjectStatus) => {
    const base = 'px-2 py-0.5 rounded-full text-xs border'
    switch (status) {
      case 'active':
        return <span className={cx(base, 'bg-green-500/10 text-green-400 border-green-500/20')}>active</span>
      case 'paused':
        return <span className={cx(base, 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20')}>paused</span>
      case 'parked':
        return <span className={cx(base, 'bg-blue-500/10 text-blue-400 border-blue-500/20')}>parked</span>
      case 'legacy':
        return <span className={cx(base, 'bg-gray-500/10 text-gray-300 border-gray-500/20')}>legacy</span>
      case 'killed':
        return <span className={cx(base, 'bg-red-500/10 text-red-400 border-red-500/20')}>killed</span>
    }
  }

  const canReorder = useMemo(() => projects.length > 1, [projects.length])

  async function reorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const next = [...projects]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setProjects(next)

    // persist
    await fetch('/api/projects/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map(p => p.id) }),
    }).catch(() => {
      // if fails, reload server truth
      refresh()
    })

    // reload to get correct contiguous ranks from server
    refresh()
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">Global force-ranked stack (1..N). Reorder to change priority.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-9 w-64 max-w-[45vw] rounded-md border border-border bg-background px-3 text-sm"
          />
          <button
            onClick={() => refresh()}
            className="h-9 px-3 rounded-md border border-border bg-card hover:bg-secondary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading…</div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No projects yet. (We’ll seed these once GitHub CLI is re-authed.)</div>
            ) : (
              projects.map((p, idx) => (
                <div
                  key={p.id}
                  className={cx(
                    'p-3 flex items-start justify-between gap-3 cursor-pointer hover:bg-secondary/40',
                    selected?.id === p.id && 'bg-secondary/60'
                  )}
                  onClick={() => setSelected(p)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-8">#{p.priority_rank}</span>
                      <span className="font-medium truncate">{p.name}</span>
                      {statusBadge(p.status)}
                      {typeof p.link_count === 'number' && (
                        <span className="text-xs text-muted-foreground">links: {p.link_count}</span>
                      )}
                    </div>
                    {p.purpose && (
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.purpose}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                      {p.owner && <span>Owner: {p.owner}</span>}
                      {p.sprint && <span>Sprint: {p.sprint}</span>}
                    </div>
                  </div>

                  {canReorder && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={(e) => { e.stopPropagation(); reorder(idx, idx - 1) }}
                        className="h-8 w-8 rounded-md border border-border bg-background hover:bg-secondary disabled:opacity-40"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        disabled={idx === projects.length - 1}
                        onClick={(e) => { e.stopPropagation(); reorder(idx, idx + 1) }}
                        className="h-8 w-8 rounded-md border border-border bg-background hover:bg-secondary disabled:opacity-40"
                        title="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="font-semibold">Details</div>
            <div className="text-xs text-muted-foreground">Select a project to view links and notes.</div>
          </div>

          {!selected ? (
            <div className="p-4 text-sm text-muted-foreground">No project selected.</div>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="text-base font-medium">{selected.name}</div>
              </div>

              {selected.purpose && (
                <div>
                  <div className="text-sm text-muted-foreground">Purpose</div>
                  <div className="text-sm whitespace-pre-wrap">{selected.purpose}</div>
                </div>
              )}

              {selected.notes && (
                <div>
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <div className="text-sm whitespace-pre-wrap">{selected.notes}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-2">Links</div>
                {links.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No links yet.</div>
                ) : (
                  <div className="space-y-2">
                    {links.map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{l.label}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {l.url || l.local_path}
                          </div>
                        </div>
                        {l.url ? (
                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary"
                          >
                            Open
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
