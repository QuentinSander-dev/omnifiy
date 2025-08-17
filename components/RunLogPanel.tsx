"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

type Event = {
  type: 'status' | 'step' | 'tool' | 'error' | 'done'
  data: { jobId: string; message?: string; payload?: any; step?: string }
}

export function RunLogPanel({ jobId, onStepChange }: { jobId: string; onStepChange?: (step: string) => void }) {
  const [events, setEvents] = useState<Event[]>([])
  const evtRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource(`/api/events?jobId=${encodeURIComponent(jobId)}`)
    evtRef.current = es
    es.addEventListener('status', (e) => push({ type: 'status', data: JSON.parse((e as MessageEvent).data) }))
    es.addEventListener('step', (e) => push({ type: 'step', data: JSON.parse((e as MessageEvent).data) }))
    es.addEventListener('tool', (e) => push({ type: 'tool', data: JSON.parse((e as MessageEvent).data) }))
    es.addEventListener('error', (e) => push({ type: 'error', data: JSON.parse((e as MessageEvent).data) }))
    es.addEventListener('done', (e) => push({ type: 'done', data: JSON.parse((e as MessageEvent).data) }))
    return () => {
      es.close()
      evtRef.current = null
    }
  }, [jobId])

  function push(evt: Event) {
    setEvents((prev) => [...prev, evt])
    if (evt.type === 'step' && evt.data.step && onStepChange) {
      onStepChange(evt.data.step)
    }
  }

  const latestStep = useMemo(() => events.filter((e) => e.type === 'step').slice(-1)[0]?.data.step, [events])

  return (
    <div data-testid="runlog" className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-muted-foreground">Job: {jobId}</div>
      <div className="grid gap-2">
        {events.map((e, i) => (
          <div key={i} className="text-xs">
            <span className="text-muted-foreground">[{e.type}]</span> {e.data.message}
            {e.data.payload != null && (
              <pre className="mt-1 max-h-60 overflow-auto rounded-md bg-muted p-2">{JSON.stringify(e.data.payload, null, 2)}</pre>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">Latest step: {latestStep || 'n/a'}</div>
    </div>
  )
}

