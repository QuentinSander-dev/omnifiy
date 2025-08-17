import { z } from 'zod'
import { ENV, env } from '../lib/env'
import { logger } from '../lib/logger'
import { PageDraftSchema, PublishedPageSchema } from '../lib/schemas'
import { MCPError } from './crawler'

const PublishInput = z.object({ pages: z.array(PageDraftSchema), jobId: z.string().optional() })
const PublishOutput = z.array(PublishedPageSchema)

export async function publish(input: z.infer<typeof PublishInput>) {
  const { pages, jobId } = PublishInput.parse(input)
  if (!ENV.MCP_SITE_WRITER_URL) {
    logger.warn('MCP_SITE_WRITER_URL not set; returning mock published pages', { jobId })
    return PublishOutput.parse(
      pages.map((p) => ({ ...p, url: `https://example.com/${p.slug}`, status: 'published' as const }))
    )
  }
  const res = await fetch(`${ENV.MCP_SITE_WRITER_URL}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ pages, jobId, baseUrl: env.PREVIEW_BASE_URL }),
  })
  if (!res.ok) throw new MCPError('siteWriter.publish failed', { jobId, cause: await res.text() })
  const data = await res.json()
  return PublishOutput.parse(data)
}

