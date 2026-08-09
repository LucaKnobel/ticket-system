<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createTicket, deleteTicket, getTickets, updateTicket } from '@/api/tickets'
import AppLogo from '@/components/AppLogo.vue'
import TicketList from '@/components/TicketList.vue'
import TicketModal from '@/components/TicketModal.vue'
import { useAuthSession } from '@/composables/useAuthSession'
import type { CreateTicketRequestDto, TicketResponseDto, UpdateTicketRequestDto } from '@ticket-system/shared'

const router = useRouter()
const { currentUser, signOut } = useAuthSession()

const tickets = ref<TicketResponseDto[]>([])
const loading = ref(false)
const banner = ref('')
const bannerType = ref<'success' | 'error'>('success')
const modalOpen = ref(false)
const modalMode = ref<'view' | 'create' | 'edit'>('view')
const selectedTicket = ref<TicketResponseDto | null>(null)
const submitting = ref(false)
const modalError = ref('')

const loadTickets = async () => {
  loading.value = true
  try {
    tickets.value = await getTickets()
  } catch {
    banner.value = 'An unexpected error occurred.'
    bannerType.value = 'error'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedTicket.value = null
  modalMode.value = 'create'
  modalError.value = ''
  modalOpen.value = true
}

const openViewModal = (ticket: TicketResponseDto) => {
  selectedTicket.value = ticket
  modalMode.value = 'view'
  modalError.value = ''
  modalOpen.value = true
}

const openEditModal = (ticket: TicketResponseDto) => {
  selectedTicket.value = ticket
  modalMode.value = 'edit'
  modalError.value = ''
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  modalError.value = ''
  selectedTicket.value = null
}

const handleCreate = async (payload: CreateTicketRequestDto) => {
  submitting.value = true
  modalError.value = ''

  try {
    const nextPayload: CreateTicketRequestDto = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      priority: payload.priority,
      status: payload.status,
    }

    await createTicket(nextPayload)
    banner.value = 'Ticket created successfully.'
    bannerType.value = 'success'
    modalOpen.value = false
    selectedTicket.value = null
    modalMode.value = 'view'
    await loadTickets()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    modalError.value = message
  } finally {
    submitting.value = false
  }
}

const handleEdit = async (payload: UpdateTicketRequestDto) => {
  if (!selectedTicket.value) return

  submitting.value = true
  modalError.value = ''

  try {
    await updateTicket(selectedTicket.value.id, payload)
    banner.value = 'Ticket updated successfully.'
    bannerType.value = 'success'
    closeModal()
    await loadTickets()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    modalError.value = message
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (ticket: TicketResponseDto) => {
  const confirmed = window.confirm('Are you sure you want to delete this ticket?')
  if (!confirmed) return

  submitting.value = true

  try {
    await deleteTicket(ticket.id)
    banner.value = 'Ticket deleted successfully.'
    bannerType.value = 'success'
    await loadTickets()
  } catch {
    banner.value = 'An unexpected error occurred.'
    bannerType.value = 'error'
  } finally {
    submitting.value = false
  }
}

const ensureAuth = async () => {
  if (!currentUser.value) {
    await router.push('/login')
    return
  }

  await loadTickets()
}

onMounted(() => {
  void ensureAuth()
})
</script>

<template>
  <main class="page-shell">
    <header class="topbar">
      <AppLogo size="sm" />

      <div class="topbar-meta">
        <div v-if="currentUser" class="user-meta">
          <span>{{ currentUser.name }}</span>
          <span class="role-pill">{{ currentUser.role }}</span>
        </div>
        <button type="button" class="ghost-button" @click="signOut">Logout</button>
      </div>
    </header>

    <section class="content-card">
      <div class="content-header">
        <div>
          <h1>Tickets</h1>
          <p>Manage and review tickets in one place.</p>
        </div>
        <button type="button" @click="openCreateModal">Create Ticket</button>
      </div>

      <p v-if="banner" class="banner" :class="`banner--${bannerType}`">{{ banner }}</p>

      <TicketList :tickets="tickets" :current-user="currentUser" :loading="loading" @view="openViewModal"
        @edit="openEditModal" @delete="handleDelete" />
    </section>

    <TicketModal :open="modalOpen" :mode="modalMode" :ticket="selectedTicket" :current-user="currentUser"
      :is-submitting="submitting" :error="modalError" @close="closeModal"
      @submit="(payload) => modalMode === 'create' ? handleCreate(payload as CreateTicketRequestDto) : handleEdit(payload as UpdateTicketRequestDto)" />
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.topbar-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.role-pill {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.ghost-button {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.content-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.banner {
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
  border-radius: var(--radius-md);
}

.banner--success {
  background: rgba(22, 163, 74, 0.16);
  color: var(--color-success);
}

.banner--error {
  background: rgba(220, 38, 38, 0.14);
  color: var(--color-danger);
}

@media (max-width: 640px) {
  .page-shell {
    padding: 1rem;
  }

  .topbar,
  .content-header,
  .topbar-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
