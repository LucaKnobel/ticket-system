<script setup lang="ts">
import { ref } from 'vue'

import { LoginRequestSchema } from '@ticket-system/shared'

import { login } from '@/api/auth'
import { useAuthSession } from '@/composables/useAuthSession'

/**
 * Emitted after a successful login request.
 */
const emit = defineEmits<{
  success: []
}>()

const { setUser } = useAuthSession()

const email = ref('')
const password = ref('')

const emailError = ref('')
const passwordError = ref('')
const loginError = ref('')

/**
 * Validates form input and triggers the login API call.
 * Emits `success` when authentication succeeds.
 */
const onSubmit = async () => {
  emailError.value = ''
  passwordError.value = ''
  loginError.value = ''

  const result = LoginRequestSchema.safeParse({
    email: email.value,
    password: password.value,
  })

  if (!result.success) {
    for (const issue of result.error.issues) {
      if (issue.path[0] === 'email' && !emailError.value) {
        emailError.value = issue.message
      }

      if (issue.path[0] === 'password' && !passwordError.value) {
        passwordError.value = issue.message
      }
    }

    return
  }

  try {
    const response = await login(result.data)
    const responseUser = (response as { user?: typeof response }).user ?? response

    setUser({
      id: responseUser.id,
      name: responseUser.name,
      email: responseUser.email,
      role: responseUser.role,
    })
    emit('success')
  } catch {
    loginError.value = 'Invalid email or password.'
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="onSubmit">
    <h1 class="title">Sign in</h1>

    <p class="subtitle">
      Sign in to access the ticket system.
    </p>

    <div class="field">
      <label for="email">Email</label>

      <input id="email" v-model="email" name="email" type="email" autocomplete="email" placeholder="Enter your email"
        required />

      <p v-if="emailError" class="error">{{ emailError }}</p>
    </div>

    <div class="field">
      <label for="password">Password</label>

      <input id="password" v-model="password" name="password" type="password" autocomplete="current-password"
        placeholder="Enter your password" required />

      <p v-if="passwordError" class="error">{{ passwordError }}</p>
    </div>

    <p v-if="loginError" class="error">Invalid email or password.</p>

    <button type="submit">
      Sign in
    </button>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 420px;

  padding: 2rem;

  background: var(--color-surface);

  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);

  box-shadow: var(--shadow-md);
}

.title {
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  margin-bottom: 2rem;

  text-align: center;
  color: var(--color-text-muted);
}

.field {
  display: flex;
  flex-direction: column;

  margin-bottom: 1.25rem;
}

.field label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.error {
  margin-top: 0.5rem;
  color: #c62828;
  font-size: 0.875rem;
}

button {
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .login-form {
    padding: 1.5rem;
  }
}
</style>
