import { v } from 'convex/values'
import { action, mutation, query } from 'convex/server'
import { api, internal } from './_generated/api'

export const enqueueCampaign = mutation({
  args: { orgId: v.string(), userId: v.string(), payload: v.any() },
  handler: async (ctx, { orgId, userId, payload }) => {
    const now = Date.now()
    const jobId = await ctx.db.insert('jobs', { orgId, userId, payload, status: 'queued', createdAt: now, updatedAt: now })
    await ctx.scheduler.runAfter(0, internal.jobs.runCampaignAction, { jobId })
    return jobId
  },
})

export const tailEvents = query({
  args: { jobId: v.id('jobs'), cursor: v.optional(v.number()) },
  handler: async (ctx, { jobId, cursor }) => {
    const since = cursor ?? 0
    const events = await ctx.db
      .query('jobEvents')
      .withIndex('by_job', (q) => q.eq('jobId', jobId))
      .filter((q) => q.gt(q.field('ts'), since))
      .order('asc')
      .take(200)
    const nextCursor = events.length ? events[events.length - 1].ts : since
    return { events, nextCursor }
  },
})

async function emit(ctx: any, jobId: string, event: string, data: any) {
  await ctx.db.insert('jobEvents', { jobId, event, data, ts: Date.now() })
}

export const runCampaignAction = action({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(internal.jobs._getJob, { jobId })
    if (!job) return
    await ctx.runMutation(internal.jobs._setStatus, { jobId, status: 'running' })
    await emit(ctx, jobId, 'status', { message: 'started' })
    try {
      const { run } = await import('../server/runCampaignConvexImpl')
      let finalResult: any = null
      await run({
        job: { _id: jobId as unknown as string, payload: job.payload, createdAt: job.createdAt },
        onEvent: (evt) => emit(ctx, jobId, evt.event, evt.data),
        onFinal: (res) => {
          finalResult = res
        },
      })
      if (finalResult) {
        const proof = {
          jobId: jobId as unknown as string,
          site: job.payload?.site,
          startedAt: job.createdAt,
          finishedAt: Date.now(),
          clusters: finalResult.clusters ?? [],
          pages: finalResult.pages ?? [],
          schema: finalResult.schema ?? [],
          interlinks: finalResult.interlinks ?? [],
          submittedToIndex: finalResult.submittedToIndex ?? [],
          serpProof: finalResult.serpProof ?? [],
        }
        await ctx.runMutation(internal.jobs.saveProofPack, { jobId, proof })
      }
      await ctx.runMutation(internal.jobs._setStatus, { jobId, status: 'done' })
      await emit(ctx, jobId, 'done', { ok: true })
    } catch (e: any) {
      await ctx.runMutation(internal.jobs._setError, { jobId, error: String(e?.message || e) })
      await emit(ctx, jobId, 'error', { message: String(e?.message || e) })
    }
  },
})

export const _getJob = query({
  args: { jobId: v.id('jobs') },
  handler: async (ctx, { jobId }) => ctx.db.get(jobId),
})

export const _setStatus = mutation({
  args: { jobId: v.id('jobs'), status: v.string() },
  handler: async (ctx, { jobId, status }) => {
    await ctx.db.patch(jobId, { status, updatedAt: Date.now() })
  },
})

export const _setError = mutation({
  args: { jobId: v.id('jobs'), error: v.string() },
  handler: async (ctx, { jobId, error }) => {
    await ctx.db.patch(jobId, { status: 'error', error, updatedAt: Date.now() })
  },
})

export const saveProofPack = mutation({
  args: { jobId: v.id('jobs'), proof: v.any() },
  handler: async (ctx, { jobId, proof }) => {
    const bytes = new TextEncoder().encode(JSON.stringify(proof, null, 2))
    const storageId = await ctx.storage.store(bytes)
    await ctx.db.patch(jobId, { proofStorageId: storageId, updatedAt: Date.now() })
    return storageId
  },
})

