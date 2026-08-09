import { computed, ref, watch, type Ref } from 'vue'

import {
  CreateTicketRequestSchema,
  UpdateTicketRequestSchema,
  type CreateTicketRequestDto,
  type TicketResponseDto,
  type UpdateTicketRequestDto,
} from '@ticket-system/shared'

export type TicketFormMode = 'view' | 'create' | 'edit'

export type TicketFormState = {
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  assignedToId: string
}

export type UseTicketModalFormOptions = {
  mode: Ref<TicketFormMode>
  ticket: Ref<TicketResponseDto | null>
  canEditAssignedTo: Ref<boolean>
}

const createInitialFormState = (): TicketFormState => ({
  title: '',
  description: '',
  priority: 'LOW',
  status: 'OPEN',
  assignedToId: '',
})

export const useTicketModalForm = ({
  mode,
  ticket,
  canEditAssignedTo,
}: UseTicketModalFormOptions) => {
  const form = ref<TicketFormState>(createInitialFormState())
  const formErrors = ref<Record<string, string>>({})

  const resetForm = () => {
    if (ticket.value) {
      form.value = {
        title: ticket.value.title,
        description: ticket.value.description,
        priority: ticket.value.priority,
        status: ticket.value.status,
        assignedToId: ticket.value.assignedTo?.id ?? '',
      }
      return
    }

    form.value = createInitialFormState()
  }

  const validate = () => {
    formErrors.value = {}

    if (mode.value === 'create') {
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
      assignedToId:
        canEditAssignedTo.value && form.value.assignedToId ? form.value.assignedToId : null,
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

  const buildSubmitPayload = (): CreateTicketRequestDto | UpdateTicketRequestDto => {
    if (mode.value === 'create') {
      return {
        title: form.value.title.trim(),
        description: form.value.description.trim(),
        priority: form.value.priority,
        status: 'OPEN',
      }
    }

    return {
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      priority: form.value.priority,
      status: form.value.status,
      assignedToId:
        canEditAssignedTo.value && form.value.assignedToId ? form.value.assignedToId : null,
    }
  }

  const watchForReset = (open: Ref<boolean>) => {
    watch(
      () => [open.value, mode.value, ticket.value],
      () => {
        if (open.value) {
          resetForm()
        }
      },
      { flush: 'post' },
    )
  }

  const title = computed(() => {
    if (mode.value === 'create') return 'Create ticket'
    if (mode.value === 'edit') return 'Edit ticket'
    return 'Ticket details'
  })

  const submitLabel = computed(() => {
    if (mode.value === 'create') return 'Create Ticket'
    if (mode.value === 'edit') return 'Update Ticket'
    return 'Close'
  })

  return {
    form,
    formErrors,
    resetForm,
    validate,
    buildSubmitPayload,
    watchForReset,
    title,
    submitLabel,
  }
}
