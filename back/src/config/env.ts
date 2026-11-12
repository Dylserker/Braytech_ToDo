import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  CORS_ORIGIN: z.string().url().default('https://localhost:5173'),
  FRONTEND_URL: z.string().url().default('https://localhost:5173'),
  HTTPS_ENABLED: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  HTTPS_KEY_PATH: z.string().default('certs/localhost-key.pem'),
  HTTPS_CERT_PATH: z.string().default('certs/localhost.pem'),
  BUNGIE_API_KEY: z.string().min(1),
  BUNGIE_CLIENT_ID: z.coerce.number().int().positive(),
  BUNGIE_CLIENT_SECRET: z.string().min(1),
  BUNGIE_OAUTH_AUTHORIZE_URL: z.string().url(),
  BUNGIE_OAUTH_REDIRECT_URI: z.string().url(),
  BUNGIE_API_BASE_URL: z.string().url().default('https://www.bungie.net/Platform'),
})

export const env = envSchema.parse(process.env)
