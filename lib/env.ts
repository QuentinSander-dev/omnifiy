import { z } from 'zod'

// Strict env validation with defaults
const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  ANTHROPIC_MODEL: z
    .string()
    .default('claude-3-7-sonnet-2025-06-25'),
  MCP_SECRET: z.string().min(10, 'MCP_SECRET is required and must be long'),
  MCP_ENABLED: z
    .string()
    .optional()
    .transform((v) => (v == null ? true : v === 'true')),
  WEB_SEARCH_ENABLED: z
    .string()
    .optional()
    .transform((v) => (v == null ? true : v === 'true')),
  COMPUTER_USE_ENABLED: z
    .string()
    .optional()
    .transform((v) => (v == null ? false : v === 'true')),

  MCP_CRAWLER_URL: z.string().url().optional(),
  MCP_SITE_WRITER_URL: z.string().url().optional(),
  MCP_SCHEMA_URL: z.string().url().optional(),
  MCP_INTERLINKER_URL: z.string().url().optional(),
  MCP_BACKLINK_URL: z.string().url().optional(),
  MCP_GSC_URL: z.string().url().optional(),
  PREVIEW_BASE_URL: z.string().url().optional(),

  GSC_CLIENT_EMAIL: z.string().optional(),
  GSC_PRIVATE_KEY: z.string().optional(),
  MAINTENANCE_MODE: z
    .string()
    .optional()
    .transform((v) => (v == null ? false : v === 'true')),
})

export type Env = z.infer<typeof EnvSchema>

let cachedEnv: Env | null = null

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv
  const parsed = EnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors
    const message = Object.entries(formatted)
      .map(([k, v]) => `${k}: ${v?.join(', ')}`)
      .join('; ')
    throw new Error(`Invalid environment configuration: ${message}`)
  }
  // Coerce defaults post-parse for the boolean flags if undefined
  const env = parsed.data
  cachedEnv = {
    ...env,
    MCP_ENABLED: (env.MCP_ENABLED as unknown as boolean) ?? true,
    WEB_SEARCH_ENABLED: (env.WEB_SEARCH_ENABLED as unknown as boolean) ?? true,
    COMPUTER_USE_ENABLED: (env.COMPUTER_USE_ENABLED as unknown as boolean) ?? false,
  }
  return cachedEnv
}

export const ENV = getEnv()
// Alias to support imports that expect `env`
export const env = ENV

