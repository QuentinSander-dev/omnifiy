"use client"
import { useMemo } from 'react'

const steps = ['clusters', 'drafts', 'published', 'schema', 'interlinks', 'index', 'serp'] as const

export function ProgressBar({ current }: { current?: string }) {
  const idx = useMemo(() => (current ? steps.indexOf(current as any) : -1), [current])
  const pct = ((idx + 1) / steps.length) * 100
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap gap-3 text-xs">
        {steps.map((s, i) => (
          <span key={s} className={i <= idx ? 'text-foreground' : 'text-muted-foreground'}>
            {s}
          </span>
        ))}
      </div>
      <div className="h-2 w-full rounded bg-muted">
        <div className="h-2 rounded bg-primary" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  )
}

