<template>
  <BaseCard title="Weather" icon="mdi:weather-partly-cloudy">
    <div v-if="loading" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      Loading weather...
    </div>

    <div v-else-if="error" class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
      {{ error }}
    </div>

    <div v-else-if="weather" class="space-y-2">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-2xl font-bold font-ui" :style="{ color: 'var(--color-text)' }">
            {{ weather.temp }}°C
          </p>
          <p class="text-xs capitalize font-ui" :style="{ color: 'var(--color-muted)' }">
            {{ weather.description }}
          </p>
          <p class="text-xs font-ui mt-1" :style="{ color: 'var(--color-secondary)' }">
            {{ weather.city }}
          </p>
        </div>
        <img
          :src="`https://openweathermap.org/img/wn/${weather.icon}@2x.png`"
          :alt="weather.description"
          class="w-16 h-16"
        >
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { weather, loading, error, init } = useWeather()

onMounted(() => {
  init()
})
</script>
