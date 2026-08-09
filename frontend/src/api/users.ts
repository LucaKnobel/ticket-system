import type { UserSummaryResponseDto } from '@ticket-system/shared'

import { apiClient } from '@/api/client'

/**
 * Fetches all active users for admin assignment flows.
 */
export const getUsers = async (): Promise<UserSummaryResponseDto[]> => {
  const response = await apiClient('/api/users')

  if (!response.ok) {
    throw new Error('Failed to fetch users.')
  }

  return response.json() as Promise<UserSummaryResponseDto[]>
}
