"use client"
import { useState } from 'react'

type FormState = {
  site: string
  niche: string
  markets: string
  intents: string
  maxPages: number
  backlinkQueries: string
  webSearch: boolean
  computerUse: boolean
}

export function RunCampaignForm({ onStart }: { onStart: (jobId: string) => void }) {
  const [state, setState] = useState<FormState>({
    site: '',
    niche: '',
    markets: '',
    intents: '',
    maxPages: 20,
    backlinkQueries: '',
    webSearch: true,
    computerUse: false,
  })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const body = {
      site: state.site,
      niche: state.niche,
      markets: state.markets ? state.markets.split(',').map((s) => s.trim()) : undefined,
      intents: state.intents ? state.intents.split(',').map((s) => s.trim()) : undefined,
      maxPages: state.maxPages,
      backlinkQueries: state.backlinkQueries ? state.backlinkQueries.split(',').map((s) => s.trim()) : undefined,
      webSearch: state.webSearch,
      computerUse: state.computerUse,
    }
    const res = await fetch('/api/run-campaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    setLoading(false)
    if (json.jobId) onStart(json.jobId)
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Run SEO Campaign</h2>
      <p className="mt-1 text-sm text-muted-foreground">Fill the fields and launch. We’ll stream steps in real time.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Site (https://...)</label>
          <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="https://example.com" value={state.site} onChange={(e) => setState({ ...state, site: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Niche</label>
          <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="South Florida waterfront real estate" value={state.niche} onChange={(e) => setState({ ...state, niche: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Max pages</label>
          <input type="number" min={1} max={200} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="10" value={state.maxPages} onChange={(e) => setState({ ...state, maxPages: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Markets (CSV)</label>
          <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="Miami, Fort Lauderdale, Boca Raton" value={state.markets} onChange={(e) => setState({ ...state, markets: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Intents (CSV)</label>
          <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder="buy waterfront home, sell waterfront" value={state.intents} onChange={(e) => setState({ ...state, intents: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Backlink queries (CSV)</label>
          <input className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40" placeholder={'"Miami waterfront" blog, site:.edu Florida waterfront'} value={state.backlinkQueries} onChange={(e) => setState({ ...state, backlinkQueries: e.target.value })} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-6 text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" checked={state.webSearch} onChange={(e) => setState({ ...state, webSearch: e.target.checked })} />
          <span>Web Search</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4" checked={state.computerUse} onChange={(e) => setState({ ...state, computerUse: e.target.checked })} />
          <span>Computer Use</span>
        </label>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={loading} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {loading ? 'Starting…' : 'Run Campaign'}
        </button>
      </div>
    </form>
  )
}

