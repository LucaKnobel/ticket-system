import type { TicketResponseDto } from '@ticket-system/shared'

export type TicketSortKey =
  'createdAt' | 'title' | 'status' | 'priority' | 'createdBy' | 'assignedTo'
export type TicketSortDirection = 'asc' | 'desc'

/**
 * Sorts tickets by the selected column and direction.
 *
 * @param items Tickets to sort.
 * @param key Column used for sorting.
 * @param direction Sort direction, either ascending or descending.
 * @returns A new array of tickets sorted according to the provided options.
 */
export const sortTickets = (
  items: TicketResponseDto[],
  key: TicketSortKey,
  direction: TicketSortDirection,
): TicketResponseDto[] => {
  const sorted = [...items]

  sorted.sort((left, right) => {
    const compareValues = (leftValue: string, rightValue: string) => {
      return leftValue.localeCompare(rightValue, undefined, { sensitivity: 'base' })
    }

    const multiplier = direction === 'asc' ? 1 : -1

    switch (key) {
      case 'title':
        return compareValues(left.title, right.title) * multiplier
      case 'status':
        return compareValues(left.status, right.status) * multiplier
      case 'priority': {
        const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 } as const
        const leftPriority = priorityOrder[left.priority]
        const rightPriority = priorityOrder[right.priority]

        return (leftPriority - rightPriority) * multiplier
      }
      case 'createdBy':
        return compareValues(left.createdBy.name, right.createdBy.name) * multiplier
      case 'assignedTo':
        return (
          compareValues(
            left.assignedTo?.name ?? 'Unassigned',
            right.assignedTo?.name ?? 'Unassigned',
          ) * multiplier
        )
      case 'createdAt':
      default:
        return (
          (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * multiplier
        )
    }
  })

  return sorted
}
