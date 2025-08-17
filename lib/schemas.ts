import { z } from 'zod'

export const ClusterSchema = z.object({
  topic: z.string(),
  keywords: z.array(z.string()),
  targetUrl: z.string().url().optional(),
})

export const FAQSchema = z.object({
  q: z.string(),
  a: z.string(),
})

export const PageDraftSchema = z.object({
  slug: z.string(),
  title: z.string(),
  h1: z.string(),
  html: z.string(),
  meta: z.object({ description: z.string() }),
  faq: z.array(FAQSchema).optional(),
})

export const PublishedPageSchema = PageDraftSchema.extend({
  url: z.string().url(),
  status: z.enum(['published', 'failed']),
  reason: z.string().optional(),
})

export const SchemaResultSchema = z.object({
  url: z.string().url(),
  type: z.enum(['Article', 'FAQPage', 'LocalBusiness', 'ItemList']),
  jsonld: z.record(z.any()),
})

export const InterlinkEdgeSchema = z.object({
  from: z.string().url(),
  to: z.string().url(),
  anchor: z.string(),
})

export const SerpDeltaSchema = z.object({
  keyword: z.string(),
  before: z.number().nullable(),
  after: z.number().nullable(),
  timestamp: z.string(),
  proofUrl: z.string().url().optional(),
})

export const CampaignInputSchema = z.object({
  site: z.string().url(),
  niche: z.string(),
  markets: z.array(z.string()).optional(),
  intents: z.array(z.string()).optional(),
  maxPages: z.number().int().positive().max(200).optional(),
  backlinkQueries: z.array(z.string()).optional(),
  computerUse: z.boolean().optional(),
  webSearch: z.boolean().optional(),
})

export const CampaignResultSchema = z.object({
  clusters: z.array(ClusterSchema),
  pages: z.array(PublishedPageSchema),
  schema: z.array(SchemaResultSchema),
  interlinks: z.array(InterlinkEdgeSchema),
  submittedToIndex: z.array(z.string().url()),
  serpProof: z.array(SerpDeltaSchema),
})

export type Cluster = z.infer<typeof ClusterSchema>
export type PageDraft = z.infer<typeof PageDraftSchema>
export type PublishedPage = z.infer<typeof PublishedPageSchema>
export type SchemaResult = z.infer<typeof SchemaResultSchema>
export type InterlinkEdge = z.infer<typeof InterlinkEdgeSchema>
export type SerpDelta = z.infer<typeof SerpDeltaSchema>
export type CampaignInput = z.infer<typeof CampaignInputSchema>
export type CampaignResult = z.infer<typeof CampaignResultSchema>

// Z-suffixed aliases and envelopes (strict parsing for assistant messages)
export const ClusterZ = ClusterSchema
export type Cluster = z.infer<typeof ClusterZ>

export const FAQItemZ = FAQSchema
export const PageDraftZ = PageDraftSchema
export type PageDraft = z.infer<typeof PageDraftZ>

export const PublishedPageZ = PublishedPageSchema
export type PublishedPage = z.infer<typeof PublishedPageZ>

export const SchemaResultZ = SchemaResultSchema
export type SchemaResult = z.infer<typeof SchemaResultZ>

export const InterlinkEdgeZ = InterlinkEdgeSchema
export type InterlinkEdge = z.infer<typeof InterlinkEdgeZ>

export const SerpDeltaZ = SerpDeltaSchema
export type SerpDelta = z.infer<typeof SerpDeltaZ>

export const CampaignResultZ = CampaignResultSchema.extend({
  clusters: CampaignResultSchema.shape.clusters.default([]),
  pages: CampaignResultSchema.shape.pages.default([]),
  schema: CampaignResultSchema.shape.schema.default([]),
  interlinks: CampaignResultSchema.shape.interlinks.default([]),
  submittedToIndex: CampaignResultSchema.shape.submittedToIndex.default([]),
  serpProof: CampaignResultSchema.shape.serpProof.default([]),
})
export type CampaignResult = z.infer<typeof CampaignResultZ>

export const StepEnvelopeZ = z.discriminatedUnion('type', [
  z.object({ type: z.literal('step'), name: z.enum(['clusters', 'drafts', 'published', 'schema', 'interlinks', 'submittedToIndex', 'serpProof', 'log']), data: z.any() }),
  z.object({ type: z.literal('final'), result: CampaignResultZ }),
])
export type StepEnvelope = z.infer<typeof StepEnvelopeZ>

