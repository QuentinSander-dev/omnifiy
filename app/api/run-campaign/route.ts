import { NextRequest } from 'next/server'
import { CampaignInputSchema } from '../../../lib/schemas'
import { auth, currentOrganization } from '@clerk/nextjs/server'
import { api } from '../../../convex/_generated/api'
import { convex } from '../../../lib/convex'
import { ENV } from '../../../lib/env'

export async function POST(req: NextRequest) {
  if (ENV.MAINTENANCE_MODE) return new Response('Maintenance', { status: 503 })
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const org = await currentOrganization()
  const orgId = org?.id ?? `user_${userId}`

  const json = await req.json()
  const input = CampaignInputSchema.parse(json)

  // Check entitlements/quota
  const ok = (await convex.mutation(api.billing.checkAndReserveRun, { orgId })) as any
  if (!(ok as any)?.allowed) {
    return Response.json({ error: (ok as any)?.reason || 'Payment required' }, { status: 402 })
  }

  // Enqueue job in Convex
  const jobId = await convex.mutation(api.jobs.enqueueCampaign, { orgId, userId, payload: { ...input, limits: ok.limits } })
  return Response.json({ jobId })
}

