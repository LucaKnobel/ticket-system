<script setup lang="ts">
import AppLogo from "@/components/AppLogo.vue";
import LoginForm from "@/components/LoginForm.vue";
</script>

<template>
  <main class="login-page">
    <AppLogo />

    <LoginForm />
  </main>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
  padding: 2rem;

  gap: 2rem;
}

@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
    gap: 1.5rem;
  }
}
</style>
