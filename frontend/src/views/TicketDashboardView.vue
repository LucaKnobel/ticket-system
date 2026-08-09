<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createTicket, deleteTicket, getTickets, updateTicket } from '@/api/tickets'
import AppLogo from '@/components/AppLogo.vue'
import Banner from '@/components/Banner.vue'
import TicketList from '@/components/TicketList.vue'
import TicketModal from '@/components/TicketModal.vue'
import { useAuthSession } from '@/composables/useAuthSession'
import type { CreateTicketRequestDto, TicketResponseDto, UpdateTicketRequestDto } from '@ticket-system/shared'
import { sortTickets, type TicketSortDirection, type TicketSortKey } from '@/utils/ticket-sorting'

const router = useRouter()
const { currentUser, signOut } = useAuthSession()

const handleSignOut = async () => {
  await signOut()
  await router.push('/login')
}

const tickets = ref<TicketResponseDto[]>([])
const loading = ref(false)
const bannerText = ref('')
const bannerType = ref<'success' | 'error'>('success')
const bannerVisible = ref(false)
const modalOpen = ref(false)
const modalMode = ref<'view' | 'create' | 'edit'>('view')
const selectedTicket = ref<TicketResponseDto | null>(null)
const submitting = ref(false)
const modalError = ref('')
const sortKey = ref<TicketSortKey>('createdAt')
const sortDirection = ref<TicketSortDirection>('desc')

const sortedTickets = computed(() => sortTickets(tickets.value, sortKey.value, sortDirection.value))

const toggleSort = (key: TicketSortKey) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortKey.value = key
  sortDirection.value = key === 'createdAt' ? 'desc' : 'asc'
}

const loadTickets = async () => {
  loading.value = true
  try {
    tickets.value = await getTickets()
  } catch {
    bannerText.value = 'An unexpected error occurred.'
    bannerType.value = 'error'
    bannerVisible.value = true
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
    bannerText.value = 'Ticket created successfully.'
    bannerType.value = 'success'
    bannerVisible.value = true
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
    bannerText.value = 'Ticket updated successfully.'
    bannerType.value = 'success'
    bannerVisible.value = true
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
    bannerText.value = 'Ticket deleted successfully.'
    bannerType.value = 'success'
    bannerVisible.value = true
    await loadTickets()
  } catch {
    bannerText.value = 'An unexpected error occurred.'
    bannerType.value = 'error'
    bannerVisible.value = true
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
          <div class="user-info-stack">
            <span>User: {{ currentUser.name }}</span>
            <span>Role: {{ currentUser.role === 'ADMIN' ? 'Admin' : 'User' }}</span>
          </div>
        </div>
        <button type="button" class="ghost-button" @click="handleSignOut">Logout</button>
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

      <Banner v-if="bannerVisible || bannerText" :text="bannerText" :type="bannerType" :visible="bannerVisible"
        :delay-ms="5000" @hide="bannerText = ''; bannerVisible = false" />

      <TicketList :tickets="sortedTickets" :current-user="currentUser" :loading="loading" :sort-key="sortKey"
        :sort-direction="sortDirection" @sort="toggleSort" @view="openViewModal" @edit="openEditModal"
        @delete="handleDelete" />
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
  gap: 1rem;
  font-weight: 600;
  color: var(--color-text);
  padding: 0.45rem 0.7rem;
  border-radius: 0.65rem;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.user-info-stack {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  line-height: 1.3;
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

.sort-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.sort-button {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.sort-button span {
  font-weight: 700;
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

  .topbar {
    align-items: flex-start;
    gap: 0.7rem;
  }

  .topbar-meta {
    width: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-meta {
    display: none;
  }

  .ghost-button {
    align-self: flex-end;
    width: auto;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  :deep(.app-logo) {
    transform: scale(0.9);
    transform-origin: left center;
  }
}
</style>
