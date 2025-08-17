import { mutation } from 'convex/server'
import { v } from 'convex/values'

export const checkAndReserveRun = mutation({
  args: { orgId: v.string() },
  handler: async (ctx, { orgId }) => {
    const ent = await ctx.db
      .query('entitlements')
      .withIndex('by_orgId', (q) => q.eq('orgId', orgId))
      .unique()
    const limits = ent?.limits ?? { runsPerDay: 3, pagesPerRun: 10, backlinkProspects: 25 }
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const today = start.getTime()
    const runs = await ctx.db
      .query('jobs')
      .withIndex('by_orgId', (q) => q.eq('orgId', orgId))
      .filter((q) => q.gte(q.field('createdAt'), today))
      .collect()
    if (runs.length >= limits.runsPerDay) {
      return { allowed: false, reason: 'Daily run limit reached' }
    }
    return { allowed: true, limits }
  },
})

