<template>
  <BaseCard title="Weather" icon="mdi:weather-partly-cloudy">
    <div v-if="loading && !weather" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading weather...
    </div>

    <div
      v-else-if="error && !weather"
      class="flex items-start justify-between gap-2"
    >
      <p class="text-sm font-ui m-0" :style="{ color: 'var(--color-muted)' }">
        {{ error }}
      </p>
      <CbHint text="Retry weather" :blocked="refreshing">
        <button
          type="button"
          class="weather-refresh weather-refresh--lg cb-icobtn"
          :disabled="refreshing"
          aria-label="Retry weather"
          @click.stop="onRefresh"
        >
          <Icon
            name="mdi:refresh"
            size="15"
            :class="{ 'weather-refresh-spin': refreshing }"
          />
        </button>
      </CbHint>
    </div>

    <div v-else-if="weather" class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <p class="text-2xl font-bold font-ui m-0" :style="{ color: 'var(--color-text)' }">
            {{ weather.temp }}°C
          </p>
          <p class="text-xs font-ui m-0" :style="{ color: 'var(--color-muted)' }">
            {{ weather.description }}
          </p>
          <div class="weather-city-row mt-1 min-w-0">
            <span
              class="weather-city-name truncate"
              :style="{ color: 'var(--color-secondary)' }"
            >
              {{ weather.city }}
            </span>
            <CbHint
              text="Refresh weather & location"
              :blocked="loading || refreshing"
            >
              <button
                type="button"
                class="weather-refresh cb-icobtn"
                :disabled="loading || refreshing"
                aria-label="Refresh weather"
                @click.stop="onRefresh"
              >
                <Icon
                  name="mdi:refresh"
                  size="13"
                  :class="{ 'weather-refresh-spin': refreshing }"
                />
              </button>
            </CbHint>
          </div>
          <p
            v-if="updatedLabel"
            class="weather-updated m-0"
            :style="{ color: 'var(--color-muted)' }"
          >
            {{ updatedLabel }}
          </p>
        </div>
        <Icon
          :name="weather.icon"
          size="56"
          class="flex-none weather-condition-icon"
          :style="{ color: 'var(--color-primary)' }"
          :aria-label="weather.description"
        />
      </div>
      <p
        v-if="error"
        class="text-[11px] font-ui m-0"
        :style="{ color: 'var(--color-muted)' }"
      >
        {{ error }}
      </p>
    </div>
  </BaseCard>

  <Teleport to="body">
    <Transition name="board-toast">
      <div
        v-if="toastMessage"
        class="board-toast fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 px-3.5 py-2 rounded-lg text-[12px] font-ui pointer-events-none"
        :style="{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid rgba(var(--color-muted-rgb), 0.25)',
          boxShadow: '0 8px 28px rgba(0,0,0,.35)',
        }"
        role="status"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { weather, loading, refreshing, error, lastFetchedAt, init, refresh } = useWeather()

const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

/** Ticks so “Xm ago” stays fresh without waiting for the next weather fetch */
const nowTick = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

const updatedLabel = computed(() => {
  if (!lastFetchedAt.value) return ''
  // Depend on nowTick so the label recomputes every tick
  void nowTick.value
  return formatUpdatedAgo(lastFetchedAt.value)
})

function formatUpdatedAgo(at: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - at) / 1000))
  if (sec < 15) return 'Updated just now'
  if (sec < 60) return `Updated ${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `Updated ${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `Updated ${hr}h ago`
  return `Updated ${Math.floor(hr / 24)}d ago`
}

onMounted(() => {
  void init()
  tickTimer = setInterval(() => {
    nowTick.value = Date.now()
  }, 15_000)
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
  if (tickTimer) clearInterval(tickTimer)
})

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2200)
}

async function onRefresh() {
  const result = await refresh()
  nowTick.value = Date.now()
  if (result.ok) {
    showToast(`Weather updated · ${result.city}`)
  }
  else {
    showToast(result.message)
  }
}
</script>

<style scoped>
.weather-city-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  line-height: 1;
}

.weather-city-name {
  font-size: 12px;
  font-family: inherit;
  line-height: 1;
}

.weather-updated {
  margin-top: 4px;
  font-size: 10px;
  font-family: inherit;
  letter-spacing: 0.01em;
  line-height: 1.2;
  opacity: 0.75;
}

.weather-refresh {
  flex: none;
  width: 14px;
  height: 14px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 0;
}

.weather-refresh:disabled {
  opacity: 0.4;
  cursor: default;
}

.weather-refresh:hover:not(:disabled) {
  color: var(--color-text);
}

.weather-refresh :deep(svg) {
  display: block;
  width: 13px;
  height: 13px;
}

.weather-refresh--lg {
  width: 24px;
  height: 24px;
}

.weather-refresh--lg :deep(svg) {
  width: 15px;
  height: 15px;
}

.weather-city-row :deep(.cb-hint) {
  flex: none;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.weather-refresh-spin {
  animation: weather-spin 0.8s linear infinite;
}

@keyframes weather-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .weather-refresh-spin {
    animation: none;
  }
}
</style>

<style>
.board-toast-enter-active,
.board-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.board-toast-enter-from,
.board-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
