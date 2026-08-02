<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: "sm" | "md" | "lg";
  }>(),
  {
    size: "md",
  },
);
</script>

<template>
  <div class="app-logo" :class="`app-logo--${size}`" aria-label="TicketSystem logo">
    <div class="badge">
      <span class="ticket-icon">🎟</span>
    </div>
    <div class="text-block">
      <span class="title">TicketSystem</span>
    </div>
  </div>
</template>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: var(--color-surface);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.app-logo::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.app-logo--sm {
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
}

.app-logo--lg {
  gap: 1rem;
  padding: 0.95rem 1.3rem;
}

.badge {
  display: grid;
  place-items: center;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  font-size: 1.25rem;
  position: relative;
  z-index: 1;
}

.app-logo--sm .badge {
  width: 2.2rem;
  height: 2.2rem;
  font-size: 1rem;
}

.app-logo--lg .badge {
  width: 3.3rem;
  height: 3.3rem;
  font-size: 1.5rem;
}

.text-block {
  display: flex;
  align-items: center;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--color-surface);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
}

.app-logo--sm .title {
  font-size: 0.95rem;
}

.app-logo--lg .title {
  font-size: 1.55rem;
  font-weight: 900;
}
</style>
