import { env } from '@/config/env'

export const apiClient = async (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(`${env.apiBaseUrl}${path}`, {
    credentials: 'include',
    ...init,
  })
}
