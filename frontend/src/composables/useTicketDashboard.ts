import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { createTicket, deleteTicket, getTickets, updateTicket } from '@/api/tickets'
import { useAuthSession } from '@/composables/useAuthSession'
import type {
  CreateTicketRequestDto,
  TicketResponseDto,
  UpdateTicketRequestDto,
} from '@ticket-system/shared'
import { sortTickets, type TicketSortDirection, type TicketSortKey } from '@/utils/ticket-sorting'

/**
 * Centralizes ticket dashboard state, sorting, modal flow, and banner handling for the view.
 */
export const useTicketDashboard = () => {
  const router = useRouter()
  const { currentUser, signOut } = useAuthSession()

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

  const sortedTickets = computed(() =>
    sortTickets(tickets.value, sortKey.value, sortDirection.value),
  )

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

  const handleSignOut = async () => {
    await signOut()
    await router.push('/login')
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

  const handleModalSubmit = (payload: CreateTicketRequestDto | UpdateTicketRequestDto) => {
    if (modalMode.value === 'create') {
      return handleCreate(payload as CreateTicketRequestDto)
    }

    return handleEdit(payload as UpdateTicketRequestDto)
  }

  return {
    currentUser,
    tickets,
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
    handleCreate,
    handleEdit,
    handleDelete,
    handleModalSubmit,
    handleSignOut,
  }
}
