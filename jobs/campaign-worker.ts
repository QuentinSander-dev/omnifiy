import { queue } from '../lib/queue'
import { logger } from '../lib/logger'
import { CampaignInputSchema } from '../lib/schemas'
import { runClaudeWithTools } from '../lib/anthropic'
import * as crawler from '../mcp/crawler'
import * as siteWriter from '../mcp/site-writer'
import * as schemaTool from '../mcp/schema'
import * as interlinker from '../mcp/interlinker'
import * as backlink from '../mcp/backlink'
import * as gsc from '../mcp/gsc'

// Simple tool router for development
const toolRouter = {
  async callWebSearch(query: string, freshnessDays?: number) {
    // Mock web search
    return { query, freshnessDays: freshnessDays ?? 365, results: [{ title: 'Example', url: 'https://example.com', snippet: 'Example snippet' }] }
  },
  async callMcp(name: string, args: any) {
    switch (name) {
      case 'crawler.fetch':
        return crawler.fetchContent(args)
      case 'siteWriter.publish':
        return siteWriter.publish(args)
      case 'schema.generate':
        return schemaTool.generate(args)
      case 'interlinker.plan':
        return interlinker.plan(args)
      case 'backlink.prospect':
        return backlink.prospect(args)
      case 'gsc.submitIndex':
        return gsc.submitIndex(args)
      case 'gsc.metrics':
        return gsc.metrics(args)
      default:
        throw new Error(`Unknown MCP tool: ${name}`)
    }
  },
}

export async function handleCampaign(jobId: string, payload: unknown) {
  const input = CampaignInputSchema.parse(payload)
  queue.emit(jobId, { type: 'status', data: { jobId, message: 'started' } })

  await runClaudeWithTools({
    userPayload: input,
    router: {
      webSearch: async ({ query, recencyDays }) => ({ query, recencyDays, results: [] }),
      crawler: ({ urls }) => crawler.fetchContent({ urls, jobId }),
      siteWriter: ({ pages }) => siteWriter.publish({ pages, jobId }),
      schema: ({ type, data }) => schemaTool.generate({ type, data, jobId }),
      interlinker: ({ urls, terms }) => interlinker.plan({ graph: { urls, terms }, jobId }),
      backlink: ({ queries }) => backlink.prospect({ queries, jobId }),
      gsc: ({ op, urls, params }) => gsc.call({ op, urls, params, jobId }),
    },
    onStep: async (step) => {
      switch (step.type) {
        case 'clusters':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'clusters', payload: step.data, step: 'clusters' } })
          break
        case 'drafts':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'drafts', payload: step.data, step: 'drafts' } })
          break
        case 'published':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'published', payload: step.data, step: 'published' } })
          break
        case 'schema':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'schema', payload: step.data, step: 'schema' } })
          break
        case 'interlinks':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'interlinks', payload: step.data, step: 'interlinks' } })
          break
        case 'submittedToIndex':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'submittedToIndex', payload: step.data, step: 'index' } })
          break
        case 'serpProof':
          queue.emit(jobId, { type: 'step', data: { jobId, message: 'serpProof', payload: step.data, step: 'serp' } })
          break
        case 'log':
          queue.emit(jobId, { type: 'status', data: { jobId, message: step.message } })
          break
      }
    },
  })

  queue.emit(jobId, { type: 'done', data: { jobId, message: 'complete' } })
}

// Register the worker in dev mode
queue.on('campaign', async (jobId, payload) => {
  try {
    await handleCampaign(jobId, payload)
  } catch (e) {
    logger.error('Campaign worker failed', { jobId, err: String(e) })
    queue.emit(jobId, { type: 'error', data: { jobId, message: 'worker failed', payload: String(e) } })
  }
})

