import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import LoginForm from '@/components/LoginForm.vue'
import { useAuthSession } from '@/composables/useAuthSession'
import { useTicketDashboard } from '@/composables/useTicketDashboard'

const {
  loginMock,
  getSessionMock,
  logoutMock,
  createTicketMock,
  updateTicketMock,
  deleteTicketMock,
  getTicketsMock,
  pushMock,
} = vi.hoisted(() => ({
  loginMock: vi.fn<() => Promise<unknown>>(),
  getSessionMock: vi.fn<() => Promise<unknown>>(),
  logoutMock: vi.fn<() => Promise<unknown>>(),
  createTicketMock: vi.fn<() => Promise<unknown>>(),
  updateTicketMock: vi.fn<() => Promise<unknown>>(),
  deleteTicketMock: vi.fn<() => Promise<unknown>>(),
  getTicketsMock: vi.fn<() => Promise<unknown>>(),
  pushMock: vi.fn<(path: string) => Promise<void>>(),
}))

vi.mock('@/api/auth', () => ({
  login: loginMock,
  getSession: getSessionMock,
  logout: logoutMock,
}))

vi.mock('@/api/tickets', () => ({
  createTicket: createTicketMock,
  updateTicket: updateTicketMock,
  deleteTicket: deleteTicketMock,
  getTickets: getTicketsMock,
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()

  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

describe('important frontend user flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    pushMock.mockReset()
    vi.stubGlobal(
      'confirm',
      vi.fn<() => boolean>(() => true),
    )

    const { setUser } = useAuthSession()
    setUser(null)
  })

  it('submits login and stores the authenticated user', async () => {
    loginMock.mockResolvedValue({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'USER',
    })

    const wrapper = mount(LoginForm)

    await wrapper.get('input[name="email"]').setValue('alice@example.com')
    await wrapper.get('input[name="password"]').setValue('secret123')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(loginMock).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret123',
    })
    expect(wrapper.emitted('success')).toHaveLength(1)

    const { currentUser } = useAuthSession()
    expect(currentUser.value).toEqual({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'USER',
    })
  })

  it('creates, edits, and deletes tickets through the dashboard flow', async () => {
    const { setUser } = useAuthSession()
    setUser({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'USER',
    })

    getTicketsMock.mockResolvedValue([])
    createTicketMock.mockResolvedValue({
      id: 'ticket-1',
      title: 'Printer issue',
      description: 'The printer keeps freezing.',
      status: 'OPEN',
      priority: 'HIGH',
      createdBy: { id: 'user-1', name: 'Alice' },
      assignedTo: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    updateTicketMock.mockResolvedValue({
      id: 'ticket-1',
      title: 'Updated printer issue',
      description: 'The printer still freezes.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdBy: { id: 'user-1', name: 'Alice' },
      assignedTo: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })
    deleteTicketMock.mockResolvedValue(undefined)

    const TestComponent = defineComponent({
      setup() {
        return useTicketDashboard()
      },
      template: '<div />',
    })

    const wrapper = mount(TestComponent)
    await nextTick()
    await flushPromises()

    await wrapper.vm.openCreateModal()
    await wrapper.vm.handleCreate({
      title: 'Printer issue',
      description: 'The printer keeps freezing.',
      priority: 'HIGH',
    })

    expect(createTicketMock).toHaveBeenCalledWith({
      title: 'Printer issue',
      description: 'The printer keeps freezing.',
      priority: 'HIGH',
    })
    expect(wrapper.vm.bannerText).toBe('Ticket created successfully.')
    expect(wrapper.vm.tickets[0]?.id).toBe('ticket-1')

    await wrapper.vm.openEditModal({
      id: 'ticket-1',
      title: 'Printer issue',
      description: 'The printer keeps freezing.',
      status: 'OPEN',
      priority: 'HIGH',
      createdBy: { id: 'user-1', name: 'Alice' },
      assignedTo: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    await wrapper.vm.handleEdit({
      title: 'Updated printer issue',
      description: 'The printer still freezes.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedToId: null,
    })

    expect(updateTicketMock).toHaveBeenCalledWith('ticket-1', {
      title: 'Updated printer issue',
      description: 'The printer still freezes.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedToId: null,
    })
    expect(wrapper.vm.bannerText).toBe('Ticket updated successfully.')

    await wrapper.vm.handleDelete({
      id: 'ticket-1',
      title: 'Updated printer issue',
      description: 'The printer still freezes.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdBy: { id: 'user-1', name: 'Alice' },
      assignedTo: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    })

    expect(deleteTicketMock).toHaveBeenCalledWith('ticket-1')
    expect(wrapper.vm.bannerText).toBe('Ticket deleted successfully.')
  })

  it('redirects unauthenticated users and authenticated users appropriately', async () => {
    const { setUser } = useAuthSession()
    const router = (await import('@/router')).default

    getSessionMock.mockResolvedValue(null)
    setUser(null)

    await router.push('/tickets')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('login')

    setUser({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'USER',
    })

    await router.push('/tickets')
    await router.isReady()
    await router.push('/login')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('tickets')
  })
})
