<template>
  <form class="login-form" @submit.prevent>
    <h1 class="title">Sign in</h1>

    <p class="subtitle">
      Sign in to access the ticket system
    </p>

    <div class="field">
      <label for="email">Email</label>

      <input id="email" name="email" type="email" autocomplete="email" placeholder="Enter your email" required />
    </div>

    <div class="field">
      <label for="password">Password</label>

      <input id="password" name="password" type="password" autocomplete="current-password"
        placeholder="Enter your password" required />
    </div>

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

button {
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .login-form {
    padding: 1.5rem;
  }
}
</style>
