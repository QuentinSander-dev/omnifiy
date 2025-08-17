import { z } from 'zod'
import { ENV, env } from '../lib/env'
import { logger } from '../lib/logger'
import { MCPError } from './crawler'

const ProspectInput = z.object({ queries: z.array(z.string()), jobId: z.string().optional() })
const ProspectOutput = z.array(z.object({ domain: z.string(), url: z.string().url(), contact: z.string().email().optional() }))

export async function prospect(input: z.infer<typeof ProspectInput>) {
  const { queries, jobId } = ProspectInput.parse(input)
  if (!ENV.MCP_BACKLINK_URL) {
    logger.warn('MCP_BACKLINK_URL not set; returning mock prospects', { jobId })
    return ProspectOutput.parse(
      queries.map((q, i) => ({ domain: `example${i}.com`, url: `https://example${i}.com/opportunity?src=${encodeURIComponent(q)}` }))
    )
  }
  const res = await fetch(`${ENV.MCP_BACKLINK_URL}/prospect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ queries, jobId }),
  })
  if (!res.ok) throw new MCPError('backlink.prospect failed', { jobId, cause: await res.text() })
  const json = await res.json()
  return ProspectOutput.parse(json)
}

