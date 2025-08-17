import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  jobs: defineTable({
    orgId: v.string(),
    userId: v.string(),
    status: v.union(v.literal('queued'), v.literal('running'), v.literal('done'), v.literal('error')),
    payload: v.any(),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    proofStorageId: v.optional(v.id('_storage')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_orgId', ['orgId'])
    .index('by_createdAt', ['createdAt']),

  jobEvents: defineTable({
    jobId: v.id('jobs'),
    event: v.string(),
    data: v.any(),
    ts: v.number(),
  }).index('by_job', ['jobId', 'ts']),

  entitlements: defineTable({
    orgId: v.string(),
    plan: v.string(),
    limits: v.object({
      runsPerDay: v.number(),
      pagesPerRun: v.number(),
      backlinkProspects: v.number(),
    }),
    updatedAt: v.number(),
  }).index('by_orgId', ['orgId']),

  ratelimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index('by_key', ['key']),
})

