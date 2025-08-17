import { z } from 'zod'
import { ENV, env } from '../lib/env'
import { logger } from '../lib/logger'
import { SchemaResultSchema } from '../lib/schemas'
import { MCPError } from './crawler'

const GenerateInput = z.object({ type: z.enum(['Article', 'FAQPage', 'LocalBusiness', 'ItemList']), data: z.record(z.any()), jobId: z.string().optional() })

export async function generate(input: z.infer<typeof GenerateInput>) {
  const { type, data, jobId } = GenerateInput.parse(input)
  if (!ENV.MCP_SCHEMA_URL) {
    logger.warn('MCP_SCHEMA_URL not set; returning mock JSON-LD', { jobId })
    return SchemaResultSchema.parse({ url: data.url || 'https://example.com', type, jsonld: { '@context': 'https://schema.org', '@type': type, name: data.title || 'Example' } })
  }
  const res = await fetch(`${ENV.MCP_SCHEMA_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ type, data, jobId }),
  })
  if (!res.ok) throw new MCPError('schema.generate failed', { jobId, cause: await res.text() })
  const json = await res.json()
  return SchemaResultSchema.parse(json)
}

