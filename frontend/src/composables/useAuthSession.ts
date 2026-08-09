import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { LoginResponseDto } from '@ticket-system/shared'

import { logout } from '@/api/auth'

export type AuthUser = LoginResponseDto

const user = ref<AuthUser | null>(null)

export const useAuthSession = () => {
  const router = useRouter()

  const isAuthenticated = computed(() => user.value !== null)

  const currentUser = computed(() => user.value)

  const setUser = (nextUser: AuthUser | null) => {
    user.value = nextUser
  }

  const signOut = async () => {
    try {
      await logout()
    } finally {
      setUser(null)
      await router.push('/login')
    }
  }

  return {
    isAuthenticated,
    currentUser,
    setUser,
    signOut,
  }
}
