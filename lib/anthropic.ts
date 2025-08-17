import Anthropic from 'anthropic'
import { env } from './env'
import { OMNIFIY_SYSTEM_PROMPT } from '../prompts/omnifiy-agent'
import { StepEnvelopeZ, CampaignResultZ } from './schemas'
import type { Cluster, PageDraft, PublishedPage, SchemaResult, InterlinkEdge, SerpDelta } from './schemas'

export type ToolRouter = {
	webSearch?: (args: { query: string; recencyDays?: number }) => Promise<any>
	crawler?: (args: { urls: string[] }) => Promise<any>
	siteWriter?: (args: { pages: PageDraft[] }) => Promise<PublishedPage[]>
	schema?: (args: { type: string; data: any }) => Promise<SchemaResult>
	interlinker?: (args: { urls: string[]; terms: string[] }) => Promise<InterlinkEdge[]>
	backlink?: (args: { queries: string[] }) => Promise<any[]>
	gsc?: (args: { op: 'submitIndex' | 'metrics'; urls?: string[]; params?: any }) => Promise<any>
}

export type ClaudeStep =
	| { type: 'clusters'; data: Cluster[] }
	| { type: 'drafts'; data: PageDraft[] }
	| { type: 'published'; data: PublishedPage[] }
	| { type: 'schema'; data: SchemaResult[] }
	| { type: 'interlinks'; data: InterlinkEdge[] }
	| { type: 'submittedToIndex'; data: string[] }
	| { type: 'serpProof'; data: SerpDelta[] }
	| { type: 'log'; message: string }

const SYSTEM_PROMPT = OMNIFIY_SYSTEM_PROMPT

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

export function getToolDefs() {
	const defs: any[] = []
	if (env.WEB_SEARCH_ENABLED) {
		defs.push({
			name: 'web_search',
			description: 'Search the web for fresh info and citations.',
			input_schema: {
				type: 'object',
				properties: {
					query: { type: 'string' },
					recencyDays: { type: 'number' },
				},
				required: ['query'],
			},
		})
	}
	if (env.MCP_ENABLED) {
		defs.push(
			{ name: 'crawler_fetch', input_schema: { type: 'object', properties: { urls: { type: 'array', items: { type: 'string' } } }, required: ['urls'] } },
			{ name: 'site_writer_publish', input_schema: { type: 'object', properties: { pages: { type: 'array', items: { type: 'object' } } }, required: ['pages'] } },
			{ name: 'schema_generate', input_schema: { type: 'object', properties: { type: { type: 'string' }, data: { type: 'object' } }, required: ['type', 'data'] } },
			{ name: 'interlinker_plan', input_schema: { type: 'object', properties: { urls: { type: 'array', items: { type: 'string' } }, terms: { type: 'array', items: { type: 'string' } } }, required: ['urls', 'terms'] } },
			{ name: 'backlink_prospect', input_schema: { type: 'object', properties: { queries: { type: 'array', items: { type: 'string' } } }, required: ['queries'] } },
			{ name: 'gsc', input_schema: { type: 'object', properties: { op: { type: 'string', enum: ['submitIndex', 'metrics'] }, urls: { type: 'array', items: { type: 'string' } }, params: { type: 'object' } }, required: ['op'] } },
		)
	}
	return defs
}

export async function runClaudeWithTools(opts: {
	userPayload: any
	onStep: (step: ClaudeStep) => Promise<void> | void
	router: ToolRouter
	onFinal?: (result: any) => Promise<void> | void
}) {
	const { userPayload, onStep, router } = opts

	const stream = await anthropic.messages.stream({
		model: env.ANTHROPIC_MODEL,
		system: SYSTEM_PROMPT,
		max_tokens: 4096,
		tools: getToolDefs(),
		messages: [
			{ role: 'user', content: [{ type: 'text', text: JSON.stringify(userPayload) }] as any },
		],
	})

	stream.on('tool_call', async (tc: any) => {
		try {
			const name = tc.name as string
			const input = tc.input || {}
			let result: any
			switch (name) {
				case 'web_search':
					if (!env.WEB_SEARCH_ENABLED || !router.webSearch) throw new Error('web_search disabled')
					result = await router.webSearch(input)
					break
				case 'crawler_fetch':
					result = await router.crawler?.(input)
					break
				case 'site_writer_publish':
					result = await router.siteWriter?.(input)
					break
				case 'schema_generate':
					result = await router.schema?.(input)
					break
				case 'interlinker_plan':
					result = await router.interlinker?.(input)
					break
				case 'backlink_prospect':
					result = await router.backlink?.(input)
					break
				case 'gsc':
					result = await router.gsc?.(input)
					break
				default:
					throw new Error(`Unknown tool: ${name}`)
			}
			await stream.sendToolResult({ tool_call_id: tc.id, result })
		} catch (err: any) {
			await onStep({ type: 'log', message: `Tool error: ${tc.name} → ${err?.message || String(err)}` })
			await stream.sendToolResult({ tool_call_id: tc.id, result: { error: String(err?.message || err) } })
		}
	})

	stream.on('message_delta', async (delta: any) => {
		void delta
	})

	stream.on('message', async (final: any) => {
		try {
			const raw = (final?.content ?? []).map((c: any) => ('text' in c ? c.text : '')).join('')
			const trimmed = raw.trim()
			const text = trimmed.startsWith('{') ? trimmed : raw.slice(raw.indexOf('{'))
			const obj = JSON.parse(text)
			const envParsed = StepEnvelopeZ.safeParse(obj)
			if (!envParsed.success) throw new Error('Envelope schema violation')
			const env = envParsed.data
			if (env.type === 'step') {
				const { name, data } = env
				await onStep(name === 'log' ? { type: 'log', message: String((data as any)?.message ?? 'log') } : ({ type: name as any, data } as any))
			} else if (env.type === 'final') {
				const result = CampaignResultZ.parse(env.result)
				if (opts.onFinal) await opts.onFinal(result)
				if (result.clusters.length) await onStep({ type: 'clusters', data: result.clusters })
				if (result.pages.length) await onStep({ type: 'published', data: result.pages })
				if (result.schema.length) await onStep({ type: 'schema', data: result.schema })
				if (result.interlinks.length) await onStep({ type: 'interlinks', data: result.interlinks })
				if (result.submittedToIndex.length) await onStep({ type: 'submittedToIndex', data: result.submittedToIndex })
				if (result.serpProof.length) await onStep({ type: 'serpProof', data: result.serpProof })
			}
		} catch (e: any) {
			await onStep({ type: 'log', message: `Assistant JSON parse error: ${e?.message || String(e)}` })
		}
	})

	await stream.finalMessage()
}

