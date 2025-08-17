import type { NextRequest } from 'next/server'

export type SseEvent<T = unknown> = {
  event: string
  data: T
}

export function open(headers?: Record<string, string>) {
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()
  const response = new Response(stream.readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      ...(headers || {}),
    },
  })

  async function push<T>(evt: SseEvent<T>) {
    const payload = `event: ${evt.event}\n` + `data: ${JSON.stringify(evt.data)}\n\n`
    await writer.write(encoder.encode(payload))
  }

  async function heartbeat() {
    await writer.write(encoder.encode(`: heartbeat\n\n`))
  }

  async function close() {
    try {
      await writer.close()
    } catch {}
  }

  return { response, push, heartbeat, close }
}

export function getJobIdFromRequest(req: NextRequest): string | null {
  const { searchParams } = new URL(req.url)
  return searchParams.get('jobId')
}

