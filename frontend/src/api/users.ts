import type { UserSummaryResponseDto } from '@ticket-system/shared'

import { apiClient } from '@/api/client'

/**
 * Fetches all users that can be assigned to a ticket.
 *
 * @returns A list of user summaries for assignment UI flows.
 * @throws Error when the backend responds with a non-success status code.
 */
export const getUsers = async (): Promise<UserSummaryResponseDto[]> => {
  const response = await apiClient('/api/users')

  if (!response.ok) {
    throw new Error('Failed to fetch users.')
  }

  return response.json() as Promise<UserSummaryResponseDto[]>
}
