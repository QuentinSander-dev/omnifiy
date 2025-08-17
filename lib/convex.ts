import { ConvexHttpClient } from "convex/browser"
import { createClient } from "convex/server"
import { api } from "@/convex/_generated/api"

const CONVEX_URL = process.env.CONVEX_URL!
if (!CONVEX_URL) throw new Error("Missing CONVEX_URL")

export const convex = new ConvexHttpClient(CONVEX_URL)

// For server-only calls (API routes, actions). Avoid bundling secrets in client.
export const convexServer = createClient(CONVEX_URL)

export { api }

// Dev shim that emulates a minimal Convex API using in-memory storage and the local queue
// Replace with real Convex client when available.
import { randomUUID } from 'crypto'
import { queue } from './queue'
import '../jobs/campaign-worker'

type MutationName = string
type QueryName = string

type StoredEvent = { event: string; data: any; ts: number }

const jobIdToEvents = new Map<string, StoredEvent[]>()
const jobIdToUnsub = new Map<string, () => void>()

function recordEvent(jobId: string, evt: StoredEvent) {
  if (!jobIdToEvents.has(jobId)) jobIdToEvents.set(jobId, [])
  jobIdToEvents.get(jobId)!.push(evt)
}

async function mutation(name: MutationName, args: any) {
  switch (name) {
    case 'billing.checkAndReserveRun': {
      return { allowed: true }
    }
    case 'jobs.enqueueCampaign': {
      const { payload } = args || {}
      const jobId = queue.add('campaign', payload)
      // Subscribe to queue events and mirror into our store
      if (!jobIdToUnsub.has(jobId)) {
        const unsub = queue.subscribe(jobId, (e) => {
          recordEvent(jobId, { event: e.type, data: e.data, ts: Date.now() })
        })
        jobIdToUnsub.set(jobId, unsub)
      }
      return jobId
    }
    default:
      throw new Error(`Unknown mutation ${name}`)
  }
}

async function query(name: QueryName, args: any) {
  switch (name) {
    case 'jobs.tailEvents': {
      const { jobId, cursor } = args || {}
      const list = jobIdToEvents.get(jobId) || []
      const idx = cursor ? Number(cursor) : 0
      const slice = list.slice(idx)
      const nextCursor = String(idx + slice.length)
      return { events: slice, nextCursor }
    }
    default:
      throw new Error(`Unknown query ${name}`)
  }
}

export const convex = { mutation, query }

