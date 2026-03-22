'use client'

import { useEffect, useState } from 'react'

type Project = {
  id: number
  name: string
  priority_rank: number
  status: string
}

export function ProjectSelect({
  value,
  onChange,
  allowNone = true,
}: {
  value?: number
  onChange: (next?: number) => void
  allowNone?: boolean
}) {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!ok) return
        setProjects(j)
      })
      .catch(() => {})
  }, [])

  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v ? Number(v) : undefined)
      }}
      className="w-full bg-surface-1 text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
    >
      {allowNone && <option value="">(no project)</option>}
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          #{p.priority_rank} — {p.name}
        </option>
      ))}
    </select>
  )
}
