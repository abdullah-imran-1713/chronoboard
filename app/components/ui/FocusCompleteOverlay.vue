<template>
  <Teleport to="body">
    <Transition name="focus-alert">
      <div
        v-if="alert.visible"
        class="focus-alert"
        :data-kind="alert.kind"
        role="dialog"
        aria-modal="true"
        :aria-label="alert.title"
        @click="dismiss"
        @keydown.esc.prevent="dismiss"
      >
        <div class="focus-alert-wash" aria-hidden="true" />
        <div class="focus-alert-pulse" aria-hidden="true" />

        <div
          class="focus-alert-card font-ui"
          @click.stop
        >
          <Icon
            :name="alertIcon"
            size="34"
            class="focus-alert-icon"
            :style="{ color: 'var(--color-primary)' }"
          />
          <p class="focus-alert-title m-0">
            {{ alert.title }}
          </p>
          <p
            v-if="alert.detail"
            class="focus-alert-detail m-0"
          >
            {{ alert.detail }}
          </p>
          <button
            type="button"
            class="focus-alert-dismiss"
            @click="dismiss"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { alert, dismiss } = useFocusAlert()

const alertIcon = computed(() => {
  if (alert.value.kind === 'break') return 'mdi:coffee-outline'
  if (alert.value.kind === 'countdown') return 'mdi:clock-end'
  return 'mdi:check-circle-outline'
})

function onKeydown(event: KeyboardEvent) {
  if (!alert.value.visible) return
  if (event.key === 'Escape') dismiss()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.focus-alert {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  cursor: pointer;
}

.focus-alert-wash {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(var(--color-primary-rgb), 0.42) 0%, transparent 58%),
    radial-gradient(ellipse 90% 70% at 50% 100%, rgba(var(--color-primary-rgb), 0.22) 0%, transparent 55%),
    rgba(var(--color-bg-rgb), 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: focus-alert-wash 4.2s ease-out both;
}

.focus-alert-pulse {
  position: absolute;
  left: 50%;
  top: 42%;
  width: min(72vw, 520px);
  height: min(72vw, 520px);
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: radial-gradient(circle, rgba(var(--color-primary-rgb), 0.35) 0%, transparent 68%);
  animation: focus-alert-pulse 1.8s ease-out both;
  pointer-events: none;
}

.focus-alert[data-kind='break'] .focus-alert-wash {
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(var(--color-muted-rgb), 0.28) 0%, transparent 58%),
    rgba(var(--color-bg-rgb), 0.5);
}

.focus-alert[data-kind='countdown'] .focus-alert-wash {
  background:
    radial-gradient(ellipse 80% 60% at 50% 38%, rgba(var(--color-primary-rgb), 0.48) 0%, transparent 56%),
    radial-gradient(ellipse 70% 50% at 50% 90%, rgba(var(--color-primary-rgb), 0.18) 0%, transparent 50%),
    rgba(var(--color-bg-rgb), 0.52);
}

.focus-alert-card {
  position: relative;
  z-index: 1;
  width: min(100%, 340px);
  padding: 1.35rem 1.25rem 1.1rem;
  border-radius: 18px;
  text-align: center;
  cursor: default;
  background: rgba(var(--color-surface-rgb), 0.92);
  border: 1px solid rgba(var(--color-primary-rgb), 0.35);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
  animation: focus-alert-card 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.focus-alert-icon {
  display: inline-flex;
  margin-bottom: 0.55rem;
}

.focus-alert-title {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.focus-alert-detail {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--color-muted);
}

.focus-alert-dismiss {
  margin-top: 1rem;
  border: none;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  color: var(--color-bg);
  background: var(--color-primary);
}

.focus-alert-dismiss:hover,
.focus-alert-dismiss:focus-visible {
  filter: brightness(1.06);
  outline: none;
}

.focus-alert-enter-active,
.focus-alert-leave-active {
  transition: opacity 0.28s ease;
}

.focus-alert-enter-from,
.focus-alert-leave-to {
  opacity: 0;
}

.focus-alert-enter-active .focus-alert-card,
.focus-alert-leave-active .focus-alert-card {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.focus-alert-enter-from .focus-alert-card,
.focus-alert-leave-to .focus-alert-card {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

@keyframes focus-alert-wash {
  0% {
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
}

@keyframes focus-alert-pulse {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.55);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.35);
  }
}

@keyframes focus-alert-card {
  0% {
    opacity: 0;
    transform: translateY(14px) scale(0.94);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .focus-alert-wash,
  .focus-alert-pulse,
  .focus-alert-card {
    animation: none;
  }
}
</style>
