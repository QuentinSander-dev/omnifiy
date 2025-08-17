import { z } from 'zod'
import { logger } from '../lib/logger'
import { ENV, env } from '../lib/env'

const FetchInput = z.object({ urls: z.array(z.string().url()), jobId: z.string().optional() })
const FetchOutput = z.array(
  z.object({
    url: z.string().url(),
    title: z.string().optional(),
    h1: z.string().optional(),
    text: z.string().optional(),
    links: z.array(z.string().url()).optional(),
    cwv: z
      .object({
        lcp: z.number().optional(),
        cls: z.number().optional(),
        fid: z.number().optional(),
      })
      .optional(),
  })
)

export async function fetchContent(input: z.infer<typeof FetchInput>) {
  const { urls, jobId } = FetchInput.parse(input)
  if (!ENV.MCP_CRAWLER_URL) {
    logger.warn('MCP_CRAWLER_URL not set; returning mock data', { jobId })
    return FetchOutput.parse(
      urls.map((u) => ({ url: u, title: 'Mock Title', h1: 'Mock H1', text: 'Mock content', links: [] }))
    )
  }
  const res = await fetch(`${ENV.MCP_CRAWLER_URL}/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ urls, jobId }),
  })
  if (!res.ok) throw new MCPError('crawler.fetch failed', { jobId, cause: await res.text() })
  const data = await res.json()
  return FetchOutput.parse(data)
}

export class MCPError extends Error {
  cause?: unknown
  jobId?: string
  constructor(message: string, opts?: { cause?: unknown; jobId?: string }) {
    super(message)
    this.name = 'MCPError'
    this.cause = opts?.cause
    this.jobId = opts?.jobId
  }
}

