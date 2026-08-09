<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * Returns the user to the login page from the not-found screen.
 */
const navigateHome = () => {
  void router.push('/login')
}
</script>

<template>
  <main class="page-shell">
    <section class="card">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <button type="button" @click="navigateHome">Go back</button>
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: var(--color-background);
}

.card {
  width: min(100%, 480px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  text-align: center;
}

.eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

h1 {
  margin: 0 0 0.75rem;
  font-size: 1.75rem;
}

p {
  margin: 0 0 1rem;
  color: var(--color-text-muted);
}
</style>
