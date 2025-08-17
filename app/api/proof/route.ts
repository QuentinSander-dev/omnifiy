import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { api } from '../../../convex/_generated/api'
import { convex } from '../../../lib/convex'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  const jobId = req.nextUrl.searchParams.get('jobId') as string | null
  if (!jobId) return new Response('Missing jobId', { status: 400 })

  const job = await convex.query(api.jobs._getJob, { jobId: jobId as any })
  if (!job) return new Response('Not found', { status: 404 })
  if (!job.proofStorageId) return new Response('No proof available', { status: 404 })

  // TODO: verify org ownership by user
  // Download file via signed URL
  // ConvexHttpClient currently exposes getFileUrl via internal; fall back to HTTP action if needed.
  // Here we use a simple fetch of a signed URL from a public HTTP action if you add one.
  // For now, assume a direct file URL is returned by a helper query (not implemented):
  // const url = await convex.query(api.files.getUrl, { storageId: job.proofStorageId })
  // const res = await fetch(url)
  // const bytes = new Uint8Array(await res.arrayBuffer())
  // Temporary: return minimal JSON until file helper is wired
  const bytes = new TextEncoder().encode(JSON.stringify({ message: 'Proof saved to Convex storage', storageId: job.proofStorageId }, null, 2))

  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="omnifiy-proof-${jobId}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}

