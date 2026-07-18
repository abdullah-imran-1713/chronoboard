<template>
  <BaseCard title="Next Prayer" icon="mdi:mosque">
    <div
      v-if="loading"
      class="text-sm font-ui"
      :style="{ color: 'var(--color-muted)' }"
    >
      Loading…
    </div>

    <div
      v-else-if="error"
      class="text-sm font-ui"
      :style="{ color: 'var(--color-muted)' }"
    >
      {{ error }}
    </div>

    <div
      v-else-if="nextPrayer"
      class="next-prayer"
    >
      <div class="next-prayer-main min-w-0">
        <p
          class="next-prayer-name font-ui m-0 truncate"
          :style="{ color: 'var(--color-muted)' }"
        >
          {{ nextPrayer.name }}
        </p>
        <p
          class="next-prayer-clock font-ui m-0 tabular-nums"
          :style="{ color: 'var(--color-text)' }"
        >
          {{ nextPrayer.time }}
        </p>
      </div>

      <div
        class="next-prayer-eta flex-none font-ui"
        :style="{ color: 'var(--color-primary)' }"
        :aria-label="etaLabel"
      >
        <span class="next-prayer-eta-value tabular-nums">
          {{ etaValue }}
        </span>
        <span class="next-prayer-eta-label">
          {{ etaSuffix }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { nextPrayer, loading, error, init } = usePrayerTimes()

const etaValue = computed(() => {
  return nextPrayer.value?.countdown ?? ''
})

const etaSuffix = computed(() => {
  return nextPrayer.value ? 'left' : ''
})

const etaLabel = computed(() => {
  if (!nextPrayer.value) return ''
  return `${nextPrayer.value.countdown} left`
})

onMounted(() => {
  void init()
})
</script>

<style scoped>
.next-prayer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 3.25rem;
}

.next-prayer-main {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.next-prayer-name {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.2;
}

.next-prayer-clock {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

.next-prayer-eta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.1rem;
  padding-bottom: 0.1rem;
  line-height: 1.1;
}

.next-prayer-eta-value {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.next-prayer-eta-label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.7;
}
</style>
