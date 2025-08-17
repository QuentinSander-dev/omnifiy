import { NextRequest } from 'next/server'
import { open, getJobIdFromRequest } from '../../../lib/sse'
import { api } from '../../../convex/_generated/api'
import { convex } from '../../../lib/convex'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const jobId = getJobIdFromRequest(req)
  if (!jobId) return new Response('Missing jobId', { status: 400 })

  const { response, push, heartbeat, close } = open()

  let cursor: string | null = null
  const poll = async () => {
    try {
      const { events, nextCursor } = (await convex.query(api.jobs.tailEvents, { jobId, cursor })) as any
      for (const e of events) {
        await push({ event: e.event, data: e.data })
        if (e.event === 'done' || e.event === 'error') {
          clearInterval(interval)
          await close()
          return
        }
      }
      cursor = nextCursor
    } catch {}
  }

  const interval = setInterval(() => {
    heartbeat().catch(() => {})
    poll().catch(() => {})
  }, 500)

  return response
}

