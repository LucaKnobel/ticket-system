import { beforeEach, describe, expect, it, vi } from 'vitest'

import { login } from '@/api/auth'
import { apiClient } from '@/api/client'

vi.mock('@/api/client', () => ({
  apiClient: vi.fn<(path: string, init?: RequestInit) => Promise<Response>>(),
}))

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends login payload and returns response dto on success', async () => {
    const dto = { email: 'alice@example.com', password: 'secret123' }
    const expected = { user: { id: 'u1', email: dto.email } }

    const json = vi.fn<() => Promise<unknown>>().mockResolvedValue(expected)
    vi.mocked(apiClient).mockResolvedValue({ ok: true, json } as unknown as Response)

    const result = await login(dto)

    expect(apiClient).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    })
    expect(result).toEqual(expected)
  })

  it('throws when backend responds with non-success status', async () => {
    const dto = { email: 'alice@example.com', password: 'secret123' }

    vi.mocked(apiClient).mockResolvedValue({ ok: false } as unknown as Response)

    await expect(login(dto)).rejects.toThrow('Login failed.')
  })
})
