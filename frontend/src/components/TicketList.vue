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
            <td>{{ ticket.status }}</td>
            <td>{{ ticket.priority }}</td>
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

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
