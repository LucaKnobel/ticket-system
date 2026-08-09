<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

defineOptions({
  name: 'InfoBanner',
})

const props = withDefaults(defineProps<{
  text: string
  type?: 'success' | 'error'
  visible?: boolean
  delayMs?: number
}>(), {
  type: 'success',
  visible: true,
  delayMs: 5000,
})

const emit = defineEmits<{
  hide: []
}>()

const localVisible = ref(props.visible)
let timeoutId: ReturnType<typeof setTimeout> | null = null

const clearTimeoutHandle = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

const startHideTimer = () => {
  clearTimeoutHandle()

  if (!props.visible || !props.text) {
    localVisible.value = false
    return
  }

  localVisible.value = true
  timeoutId = setTimeout(() => {
    localVisible.value = false
    emit('hide')
  }, props.delayMs)
}

watch(() => [props.text, props.visible, props.delayMs], () => {
  startHideTimer()
}, {
  immediate: true,
  flush: 'post',
})

onBeforeUnmount(() => {
  clearTimeoutHandle()
})
</script>

<template>
  <p v-if="localVisible && text" class="banner" :class="`banner--${type}`">
    {{ text }}
  </p>
</template>

<style scoped>
.banner {
  margin-bottom: 1rem;
  padding: 0.8rem 1rem;
  border-radius: var(--radius-md);
}

.banner--success {
  background: rgba(22, 163, 74, 0.16);
  color: var(--color-success);
}

.banner--error {
  background: rgba(220, 38, 38, 0.14);
  color: var(--color-danger);
}
</style>
