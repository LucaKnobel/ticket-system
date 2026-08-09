import type {
  CreateTicketRequestDto,
  TicketResponseDto,
  UpdateTicketRequestDto,
} from '@ticket-system/shared'

import { apiClient } from '@/api/client'

/**
 * Fetches all tickets from the backend.
 */
export const getTickets = async (): Promise<TicketResponseDto[]> => {
  const response = await apiClient('/api/tickets')

  if (!response.ok) {
    throw new Error('Failed to fetch tickets.')
  }

  return response.json() as Promise<TicketResponseDto[]>
}

/**
 * Fetches a single ticket by id.
 */
export const getTicket = async (id: string): Promise<TicketResponseDto> => {
  const response = await apiClient(`/api/tickets/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch ticket.')
  }

  return response.json() as Promise<TicketResponseDto>
}

/**
 * Creates a new ticket.
 */
export const createTicket = async (dto: CreateTicketRequestDto): Promise<TicketResponseDto> => {
  const response = await apiClient('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    throw new Error('Failed to create ticket.')
  }

  return response.json() as Promise<TicketResponseDto>
}

/**
 * Updates an existing ticket.
 */
export const updateTicket = async (
  id: string,
  dto: UpdateTicketRequestDto,
): Promise<TicketResponseDto> => {
  const response = await apiClient(`/api/tickets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    throw new Error('Failed to update ticket.')
  }

  return response.json() as Promise<TicketResponseDto>
}

/**
 * Deletes a ticket by id.
 */
export const deleteTicket = async (id: string): Promise<void> => {
  const response = await apiClient(`/api/tickets/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete ticket.')
  }
}
