import { randomUUID } from 'crypto'
import { logger } from './logger'

export type QueueEventType = 'status' | 'step' | 'tool' | 'error' | 'done'

export interface QueueEvent<T = unknown> {
  type: QueueEventType
  data: {
    jobId: string
    message?: string
    payload?: T
    step?: string
  }
}

export type JobHandler = (jobId: string, payload: unknown) => Promise<void>

type Job = {
  id: string
  type: string
  payload: unknown
}

class InMemoryQueue {
  private jobs: Job[] = []
  private subscribers: Map<string, Set<(event: QueueEvent) => void>> = new Map()
  private handlers: Map<string, JobHandler> = new Map()
  private processing = false

  add<T>(type: string, payload: T): string {
    const id = randomUUID()
    this.jobs.push({ id, type, payload })
    this.emit(id, { type: 'status', data: { jobId: id, message: 'queued' } })
    this.process().catch((err) => logger.error('Queue process error', { err: String(err) }))
    return id
  }

  on(type: string, handler: JobHandler) {
    this.handlers.set(type, handler)
  }

  subscribe(jobId: string, listener: (event: QueueEvent) => void) {
    if (!this.subscribers.has(jobId)) this.subscribers.set(jobId, new Set())
    this.subscribers.get(jobId)!.add(listener)
    return () => {
      this.subscribers.get(jobId)?.delete(listener)
    }
  }

  emit(jobId: string, event: QueueEvent) {
    const listeners = this.subscribers.get(jobId)
    if (!listeners) return
    for (const l of listeners) {
      try {
        l(event)
      } catch (e) {
        logger.error('Queue listener error', { jobId, err: String(e) })
      }
    }
  }

  private async process() {
    if (this.processing) return
    this.processing = true
    while (this.jobs.length > 0) {
      const job = this.jobs.shift()!
      const handler = this.handlers.get(job.type)
      if (!handler) {
        this.emit(job.id, { type: 'error', data: { jobId: job.id, message: `No handler for job type ${job.type}` } })
        continue
      }
      this.emit(job.id, { type: 'status', data: { jobId: job.id, message: 'started' } })
      try {
        await handler(job.id, job.payload)
      } catch (e) {
        this.emit(job.id, { type: 'error', data: { jobId: job.id, message: 'handler error', payload: String(e) } })
      }
    }
    this.processing = false
  }
}

export const queue = new InMemoryQueue()

