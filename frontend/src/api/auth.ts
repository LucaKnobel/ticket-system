import type { LoginRequestDto, LoginResponseDto } from '@ticket-system/shared/dto/auth'

import { apiClient } from '@/api/client'

/**
 * Authenticates a user against the backend login endpoint.
 *
 * @param dto Login payload containing email and password.
 * @returns Authenticated user DTO returned by the API.
 * @throws Error when the backend responds with a non-success status code.
 */
export const login = async (dto: LoginRequestDto): Promise<LoginResponseDto> => {
  const response = await apiClient('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    throw new Error('Login failed.')
  }

  return response.json() as Promise<LoginResponseDto>
}

/**
 * Logs out the currently authenticated user via the backend endpoint.
 *
 * @returns Resolves when the logout request succeeds.
 * @throws Error when the backend responds with a non-success status code.
 */
export const logout = async (): Promise<void> => {
  const response = await apiClient('/api/auth/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Logout failed.')
  }
}
