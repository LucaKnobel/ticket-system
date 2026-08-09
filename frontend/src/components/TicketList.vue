<script setup lang="ts">
import type { LoginResponseDto, TicketResponseDto } from '@ticket-system/shared'
import type { TicketSortDirection, TicketSortKey } from '@/utils/ticket-sorting'

const props = defineProps<{
  tickets: TicketResponseDto[]
  currentUser: LoginResponseDto | null
  loading: boolean
  sortKey: TicketSortKey
  sortDirection: TicketSortDirection
}>()

const emit = defineEmits<{
  sort: [key: TicketSortKey]
  view: [ticket: TicketResponseDto]
  edit: [ticket: TicketResponseDto]
  delete: [ticket: TicketResponseDto]
}>()

/**
 * Determines whether the current user can manage the given ticket.
 *
 * @param ticket Ticket to evaluate.
 * @returns True when the current user is an admin or the ticket owner.
 */
const canManage = (ticket: TicketResponseDto) => {
  if (!props.currentUser) return false
  if (props.currentUser.role === 'ADMIN') return true
  return ticket.createdBy.id === props.currentUser.id
}

/**
 * Formats a date string in Swiss locale style.
 *
 * @param value ISO date string to format.
 * @returns Human-readable date and time string.
 */
const formatDateTime = (value: string) => {
  return new Date(value).toLocaleString('de-CH', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
</script>

<template>
  <div class="ticket-list-card">
    <div class="table-wrapper">
      <table v-if="tickets.length > 0" class="desktop-table">
        <thead>
          <tr>
            <th>
              <button type="button" class="sort-header" @click="emit('sort', 'title')">
                Title <span>{{ props.sortKey === 'title' ? (props.sortDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" @click="emit('sort', 'status')">
                Status <span>{{ props.sortKey === 'status' ? (props.sortDirection === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" @click="emit('sort', 'priority')">
                Priority <span>{{ props.sortKey === 'priority' ? (props.sortDirection === 'asc' ? '↑' : '↓') : '↕'
                }}</span>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" @click="emit('sort', 'createdBy')">
                Created By <span>{{ props.sortKey === 'createdBy' ? (props.sortDirection === 'asc' ? '↑' : '↓') : '↕'
                }}</span>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" @click="emit('sort', 'assignedTo')">
                Assigned To <span>{{ props.sortKey === 'assignedTo' ? (props.sortDirection === 'asc' ? '↑' : '↓') : '↕'
                }}</span>
              </button>
            </th>
            <th>
              <button type="button" class="sort-header" @click="emit('sort', 'createdAt')">
                Created At <span>{{ props.sortKey === 'createdAt' ? (props.sortDirection === 'asc' ? '↑' : '↓') : '↕'
                }}</span>
              </button>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td>{{ ticket.title }}</td>
            <td>
              <span class="status-badge" :data-status="ticket.status">{{ ticket.status.replace(/_/g, ' ') }}</span>
            </td>
            <td>
              <span class="priority-badge" :data-priority="ticket.priority">{{ ticket.priority }}</span>
            </td>
            <td>{{ ticket.createdBy.name }}</td>
            <td>{{ ticket.assignedTo?.name ?? 'Unassigned' }}</td>
            <td>{{ formatDateTime(ticket.createdAt) }}</td>
            <td>
              <div class="actions">
                <button type="button" class="ghost-button" @click="emit('view', ticket)">View</button>
                <button v-if="canManage(ticket)" type="button" class="ghost-button"
                  @click="emit('edit', ticket)">Edit</button>
                <button v-if="canManage(ticket)" type="button" class="ghost-button danger"
                  @click="emit('delete', ticket)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="tickets.length > 0" class="mobile-ticket-list" aria-label="Ticket list">
        <article v-for="ticket in tickets" :key="ticket.id" class="ticket-card">
          <div class="ticket-card-header">
            <h3>{{ ticket.title }}</h3>
            <span class="status-badge" :data-status="ticket.status">{{ ticket.status.replace(/_/g, ' ') }}</span>
          </div>

          <div class="ticket-card-meta">
            <div class="ticket-chip-row">
              <span class="priority-badge" :data-priority="ticket.priority">{{ ticket.priority }}</span>
            </div>
            <div class="ticket-meta-row">
              <span class="meta-label">Assigned</span>
              <span class="meta-value">{{ ticket.assignedTo?.name ?? 'Unassigned' }}</span>
            </div>
            <div class="ticket-meta-row">
              <span class="meta-label">Created by</span>
              <span class="meta-value">{{ ticket.createdBy.name }}</span>
            </div>
            <div class="ticket-meta-row">
              <span class="meta-label">Created</span>
              <span class="meta-value">{{ formatDateTime(ticket.createdAt) }}</span>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="ghost-button" @click="emit('view', ticket)">View</button>
            <button v-if="canManage(ticket)" type="button" class="ghost-button"
              @click="emit('edit', ticket)">Edit</button>
            <button v-if="canManage(ticket)" type="button" class="ghost-button danger"
              @click="emit('delete', ticket)">Delete</button>
          </div>
        </article>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <p>No tickets available.</p>
      </div>

      <div v-else class="empty-state">
        <p>Loading tickets...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-list-card {
  background: var(--color-surface);


  overflow: hidden;
  max-width: 100%;
}

.table-wrapper {
  overflow-x: hidden;
}

.desktop-table {
  width: 100%;
  border-collapse: collapse;
}

.desktop-table th,
.desktop-table td {
  padding: 0.9rem 0.75rem;
  text-align: left;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

.desktop-table thead th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}

.sort-header {
  background: transparent;
  border: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  font-size: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.desktop-table tbody tr+tr td {
  border-top: 1px solid var(--color-border);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ghost-button {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
}

.ghost-button.danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
}

.status-badge,
.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.status-badge[data-status='OPEN'] {
  background: rgba(100, 116, 139, 0.16);
  color: #475569;
}

.status-badge[data-status='IN_PROGRESS'] {
  background: rgba(245, 158, 11, 0.18);
  color: #b45309;
}

.status-badge[data-status='CLOSED'] {
  background: rgba(34, 197, 94, 0.18);
  color: #15803d;
}

.priority-badge[data-priority='LOW'] {
  background: rgba(34, 197, 94, 0.16);
  color: #15803d;
}

.priority-badge[data-priority='MEDIUM'] {
  background: rgba(59, 130, 246, 0.16);
  color: #1d4ed8;
}

.priority-badge[data-priority='HIGH'] {
  background: rgba(239, 68, 68, 0.16);
  color: #b91c1c;
}

.mobile-ticket-list {
  display: none;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.9rem;
}

.ticket-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: linear-gradient(180deg, var(--color-surface) 0%, rgba(255, 255, 255, 0.96) 100%);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.ticket-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.ticket-card h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.ticket-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.ticket-meta-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.meta-label {
  flex-shrink: 0;
  font-weight: 600;
}

.meta-value {
  text-align: right;
  overflow-wrap: anywhere;
}

.ticket-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 767px) {
  .desktop-table {
    display: none;
  }

  .mobile-ticket-list {
    display: flex;
  }

  .empty-state {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .ticket-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .ticket-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .meta-value {
    text-align: left;
  }
}
</style>
