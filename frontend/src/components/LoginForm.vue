<template>
  <form class="login-form" @submit.prevent>
    <h1 class="title">Sign in</h1>

    <p class="subtitle">
      Sign in to access the ticket system.
    </p>

    <div class="field">
      <label for="email">Email</label>

      <input id="email" name="email" type="email" autocomplete="email" required />
    </div>

    <div class="field">
      <label for="password">Password</label>

      <input id="password" name="password" type="password" autocomplete="current-password" required />
    </div>

    <button type="submit">
      Sign in
    </button>
  </form>
</template>
