import { z } from 'zod'
import { ENV, env } from '../lib/env'
import { logger } from '../lib/logger'
import { MCPError } from './crawler'

const SubmitInput = z.object({ urls: z.array(z.string().url()), jobId: z.string().optional() })
const SubmitOutput = z.object({ submitted: z.array(z.string().url()) })

const MetricsInput = z.object({ params: z.record(z.any()), jobId: z.string().optional() })
const MetricsOutput = z.object({ impressions: z.any(), clicks: z.any(), positions: z.any() })

export async function submitIndex(input: z.infer<typeof SubmitInput>) {
  const { urls, jobId } = SubmitInput.parse(input)
  if (!ENV.MCP_GSC_URL) {
    logger.warn('GSC not fully configured; returning mock submit results', { jobId })
    return SubmitOutput.parse({ submitted: urls })
  }
  const res = await fetch(`${ENV.MCP_GSC_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ op: 'submitIndex', urls }),
  })
  if (!res.ok) throw new MCPError('gsc.submitIndex failed', { jobId, cause: await res.text() })
  const json = await res.json()
  return SubmitOutput.parse(json)
}

export async function metrics(input: z.infer<typeof MetricsInput>) {
  const { params, jobId } = MetricsInput.parse(input)
  if (!ENV.MCP_GSC_URL) {
    logger.warn('GSC not fully configured; returning mock metrics', { jobId })
    return MetricsOutput.parse({ impressions: {}, clicks: {}, positions: {} })
  }
  const res = await fetch(`${ENV.MCP_GSC_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MCP_SECRET}` },
    body: JSON.stringify({ op: 'metrics', params }),
  })
  if (!res.ok) throw new MCPError('gsc.metrics failed', { jobId, cause: await res.text() })
  const json = await res.json()
  return MetricsOutput.parse(json)
}

export async function call(input: { op: 'submitIndex' | 'metrics'; urls?: string[]; params?: any; jobId?: string }) {
  if (input.op === 'submitIndex') {
    return submitIndex({ urls: input.urls || [], jobId: input.jobId })
  }
  if (input.op === 'metrics') {
    return metrics({ params: input.params || {}, jobId: input.jobId })
  }
  throw new Error(`Unsupported GSC op: ${input.op}`)
}

