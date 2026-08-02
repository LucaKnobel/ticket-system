import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.url(),
})

const rawEnv = EnvSchema.parse(import.meta.env)

export const env = {
  apiBaseUrl: rawEnv.VITE_API_BASE_URL,
} as const
