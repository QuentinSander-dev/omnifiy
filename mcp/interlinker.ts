import { z } from 'zod'
import { ENV, env } from '../lib/env'
import { logger } from '../lib/logger'
import { InterlinkEdgeSchema } from '../lib/schemas'
import { MCPError } from './crawler'

const PlanInput = z.object({ graph: z.object({ urls: z.array(z.string().url()), terms: z.array(z.string()) }), jobId: z.string().optional() })
const PlanOutput = z.array(InterlinkEdgeSchema)

export async function plan(input: z.infer<typeof PlanInput>) {
  const { graph, jobId } = PlanInput.parse(input)
  if (!ENV.MCP_INTERLINKER_URL) {
    logger.warn('MCP_INTERLINKER_URL not set; returning mock interlink plan', { jobId })
    const edges = [] as z.infer<typeof PlanOutput>
    for (let i = 0; i < graph.urls.length - 1; i++) {
      edges.push({ from: graph.urls[i], to: graph.urls[i + 1], anchor: graph.terms[i % graph.terms.length] || 'Read more' })
    }
    return PlanOutput.parse(edges)
  }
  const res = await fetch(`${ENV.MCP_INTERLINKER_URL}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ graph, jobId }),
  })
  if (!res.ok) throw new MCPError('interlinker.plan failed', { jobId, cause: await res.text() })
  const json = await res.json()
  return PlanOutput.parse(json)
}

