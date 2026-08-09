import { computed, ref } from 'vue'

import type { LoginResponseDto } from '@ticket-system/shared'

import { getSession, logout } from '@/api/auth'

export type AuthUser = LoginResponseDto

const user = ref<AuthUser | null>(null)
const initialized = ref(false)

export const useAuthSession = () => {
  const isAuthenticated = computed(() => user.value !== null)
  const currentUser = computed(() => user.value)
  const isInitialized = computed(() => initialized.value)

  const setUser = (nextUser: AuthUser | null) => {
    user.value = nextUser
  }

  const initializeSession = async () => {
    if (initialized.value) {
      return user.value !== null
    }

    try {
      const nextUser = await getSession()
      setUser(nextUser)
      return true
    } catch {
      setUser(null)
      return false
    } finally {
      initialized.value = true
    }
  }

  const signOut = async () => {
    try {
      await logout()
    } finally {
      setUser(null)
    }
  }

  return {
    isAuthenticated,
    currentUser,
    isInitialized,
    setUser,
    initializeSession,
    signOut,
  }
}
