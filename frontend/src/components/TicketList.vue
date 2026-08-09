<script setup lang="ts">
import type { LoginResponseDto, TicketResponseDto } from '@ticket-system/shared'

const props = defineProps<{
  tickets: TicketResponseDto[]
  currentUser: LoginResponseDto | null
  loading: boolean
}>()

const emit = defineEmits<{
  view: [ticket: TicketResponseDto]
  edit: [ticket: TicketResponseDto]
  delete: [ticket: TicketResponseDto]
}>()

const canManage = (ticket: TicketResponseDto) => {
  if (!props.currentUser) return false
  if (props.currentUser.role === 'ADMIN') return true
  return ticket.createdBy.id === props.currentUser.id
}
</script>

<template>
  <div class="ticket-list-card">
    <div class="table-wrapper">
      <table v-if="tickets.length > 0">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created By</th>
            <th>Assigned To</th>
            <th>Last Updated</th>
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
            <td>{{ new Date(ticket.updatedAt).toLocaleString() }}</td>
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
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
}

.ghost-button.danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.empty-state {
  padding: 2rem;
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

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
