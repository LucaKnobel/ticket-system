import { createRouter, createWebHistory } from 'vue-router'

import { useAuthSession } from '@/composables/useAuthSession'
import LoginView from '@/views/LoginView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import TicketDashboardView from '@/views/TicketDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketDashboardView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach(async (to) => {
  const { initializeSession, isAuthenticated, isInitialized } = useAuthSession()

  if (!isInitialized.value) {
    await initializeSession()
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && isAuthenticated.value) {
    return { name: 'tickets' }
  }

  return true
})

export default router
