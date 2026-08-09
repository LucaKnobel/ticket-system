<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue'
import Banner from '@/components/Banner.vue'
import TicketList from '@/components/TicketList.vue'
import TicketModal from '@/components/TicketModal.vue'
import { useTicketDashboard } from '@/composables/useTicketDashboard'

/**
 * Dashboard view state and actions composed from the ticket dashboard composable.
 */
const {
  currentUser,
  loading,
  bannerText,
  bannerType,
  bannerVisible,
  modalOpen,
  modalMode,
  selectedTicket,
  submitting,
  modalError,
  sortKey,
  sortDirection,
  sortedTickets,
  toggleSort,
  openCreateModal,
  openViewModal,
  openEditModal,
  closeModal,
  handleDelete,
  handleModalSubmit,
  handleSignOut,
} = useTicketDashboard()
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
      :is-submitting="submitting" :error="modalError" @close="closeModal" @submit="handleModalSubmit" />
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
