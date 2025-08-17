import { runClaudeWithTools } from '../lib/anthropic'
import * as crawler from '../mcp/crawler'
import * as writer from '../mcp/site-writer'
import * as schema from '../mcp/schema'
import * as interlinker from '../mcp/interlinker'
import * as backlink from '../mcp/backlink'
import * as gsc from '../mcp/gsc'

export async function run({ job, onEvent, onFinal }: { job: { _id: string; payload: any; createdAt?: number }; onEvent: (evt: { event: string; data: any }) => Promise<void> | void; onFinal?: (res: any) => void }) {
  const jobId = job._id
  await onEvent({ event: 'log', data: { message: 'Convex worker acquired job' } })
  const limits = job.payload?.limits ?? { pagesPerRun: 10, backlinkProspects: 25 }
  await runClaudeWithTools({
    userPayload: job.payload,
    router: {
      crawler: ({ urls }) => crawler.fetchContent({ urls, jobId }),
      siteWriter: ({ pages }) => writer.publish({ pages: (pages || []).slice(0, limits.pagesPerRun), jobId }),
      schema: ({ type, data }) => schema.generate({ type, data, jobId }),
      interlinker: ({ urls, terms }) => interlinker.plan({ graph: { urls, terms }, jobId }),
      backlink: ({ queries }) => backlink.prospect({ queries: (queries || []).slice(0, limits.backlinkProspects), jobId }),
      gsc: ({ op, urls, params }) => gsc.call({ op, urls: op === 'submitIndex' ? (urls || []).slice(0, 50) : urls, params, jobId }),
    },
    onStep: async (step) => {
      if (step.type === 'log') return onEvent({ event: 'log', data: { message: step.message } })
      onEvent({ event: 'step', data: step })
    },
    onFinal: async (result) => {
      if (onFinal) onFinal(result)
    },
  })
}

