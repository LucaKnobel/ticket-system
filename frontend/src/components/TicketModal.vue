<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import {
  CreateTicketRequestSchema,
  UpdateTicketRequestSchema,
  type CreateTicketRequestDto,
  type LoginResponseDto,
  type TicketResponseDto,
  type UpdateTicketRequestDto,
  type UserSummaryResponseDto,
} from '@ticket-system/shared'

import { getUsers } from '@/api/users'

const props = defineProps<{
  open: boolean
  mode: 'view' | 'create' | 'edit'
  ticket: TicketResponseDto | null
  currentUser: LoginResponseDto | null
  isSubmitting: boolean
  error: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: CreateTicketRequestDto | UpdateTicketRequestDto]
}>()

type TicketFormState = {
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  assignedToId: string
}

const form = ref<TicketFormState>({
  title: '',
  description: '',
  priority: 'LOW',
  status: 'OPEN',
  assignedToId: '',
})

const formErrors = ref<Record<string, string>>({})
const users = ref<UserSummaryResponseDto[]>([])
const loadingUsers = ref(false)

const title = computed(() => {
  if (props.mode === 'create') return 'Create ticket'
  if (props.mode === 'edit') return 'Edit ticket'
  return 'Ticket details'
})

const submitLabel = computed(() => {
  if (props.mode === 'create') return 'Create Ticket'
  if (props.mode === 'edit') return 'Update Ticket'
  return 'Close'
})

const canEditAssignedTo = computed(() => props.currentUser?.role === 'ADMIN' && props.mode === 'edit')

const loadUsers = async () => {
  if (!canEditAssignedTo.value) {
    return
  }

  loadingUsers.value = true

  try {
    users.value = await getUsers()
  } catch {
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

const resetForm = () => {
  if (props.ticket) {
    form.value = {
      title: props.ticket.title,
      description: props.ticket.description,
      priority: props.ticket.priority,
      status: props.ticket.status,
      assignedToId: props.ticket.assignedTo?.id ?? '',
    }
  } else {
    form.value = {
      title: '',
      description: '',
      priority: 'LOW',
      status: 'OPEN',
      assignedToId: '',
    }
  }

  formErrors.value = {}
}

watch(
  () => [props.open, props.mode, props.ticket],
  () => {
    if (props.open) {
      resetForm()
      void loadUsers()
    }
  },
  { flush: 'post' },
)

onMounted(() => {
  if (props.open) {
    void loadUsers()
  }
})

const validate = () => {
  formErrors.value = {}

  if (props.mode === 'create') {
    const result = CreateTicketRequestSchema.safeParse({
      title: form.value.title,
      description: form.value.description,
      priority: form.value.priority,
      status: 'OPEN',
    })

    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path[0]
        if (path) {
          formErrors.value[path as string] = issue.message
        }
      }
      return false
    }

    return true
  }

  const result = UpdateTicketRequestSchema.safeParse({
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    status: form.value.status,
    assignedToId: canEditAssignedTo.value && form.value.assignedToId ? form.value.assignedToId : null,
  })

  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path[0]
      if (path) {
        formErrors.value[path as string] = issue.message
      }
    }
    return false
  }

  return true
}

const submit = () => {
  if (!validate()) {
    return
  }

  if (props.mode === 'create') {
    emit('submit', {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      priority: form.value.priority,
      status: 'OPEN',
    })
    return
  }

  emit('submit', {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    priority: form.value.priority,
    status: form.value.status,
    assignedToId: canEditAssignedTo.value && form.value.assignedToId ? form.value.assignedToId : null,
  })
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal-card">
      <div class="modal-header">
        <h2>{{ title }}</h2>
        <button class="ghost-button" type="button" @click="emit('close')">×</button>
      </div>

      <div v-if="props.mode === 'view' && props.ticket" class="details-grid">
        <div>
          <span class="label">Title</span>
          <p>{{ props.ticket.title }}</p>
        </div>
        <div>
          <span class="label">Status</span>
          <p><span class="status-badge" :data-status="props.ticket.status">{{ props.ticket.status.replace(/_/g, ' ')
              }}</span></p>
        </div>
        <div>
          <span class="label">Priority</span>
          <p><span class="priority-badge" :data-priority="props.ticket.priority">{{ props.ticket.priority }}</span></p>
        </div>
        <div>
          <span class="label">Created by</span>
          <p>{{ props.ticket.createdBy.name }}</p>
        </div>
        <div>
          <span class="label">Assigned to</span>
          <p>{{ props.ticket.assignedTo?.name ?? 'Unassigned' }}</p>
        </div>
        <div>
          <span class="label">Last updated</span>
          <p>{{ new Date(props.ticket.updatedAt).toLocaleString() }}</p>
        </div>
        <div class="full-width">
          <span class="label">Description</span>
          <p>{{ props.ticket.description }}</p>
        </div>
      </div>

      <form v-else class="form-grid" @submit.prevent="submit()">
        <div class="field full-width">
          <label for="ticket-title">Title</label>
          <input id="ticket-title" v-model="form.title" type="text" />
          <p v-if="formErrors.title" class="error">{{ formErrors.title }}</p>
        </div>

        <div class="field full-width">
          <label for="ticket-description">Description</label>
          <textarea id="ticket-description" v-model="form.description" rows="4" />
          <p v-if="formErrors.description" class="error">{{ formErrors.description }}</p>
        </div>

        <div class="field">
          <label for="ticket-priority">Priority</label>
          <select id="ticket-priority" v-model="form.priority">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <p v-if="formErrors.priority" class="error">{{ formErrors.priority }}</p>
        </div>

        <div v-if="props.mode === 'edit'" class="field">
          <label for="ticket-status">Status</label>
          <select id="ticket-status" v-model="form.status">
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="CLOSED">Closed</option>
          </select>
          <p v-if="formErrors.status" class="error">{{ formErrors.status }}</p>
        </div>

        <div v-if="canEditAssignedTo" class="field full-width">
          <label for="ticket-assigned">Assigned to</label>
          <select id="ticket-assigned" v-model="form.assignedToId">
            <option value="">Unassigned</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
          <p v-if="loadingUsers" class="helper-text">Loading users...</p>
          <p v-if="formErrors.assignedToId" class="error">{{ formErrors.assignedToId }}</p>
        </div>

        <p v-if="props.error" class="error full-width">{{ props.error }}</p>

        <div class="actions full-width">
          <button class="ghost-button" type="button" :disabled="props.isSubmitting"
            @click="emit('close')">Cancel</button>
          <button v-if="props.mode !== 'view'" type="submit" :disabled="props.isSubmitting">
            {{ submitLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 50;
}

.modal-card {
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.ghost-button {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.full-width {
  grid-column: 1 / -1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.label {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.error {
  color: var(--color-danger);
  font-size: 0.875rem;
}

.helper-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {

  .form-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
