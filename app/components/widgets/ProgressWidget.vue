<template>
  <BaseCard title="Progress" icon="mdi:progress-clock">
    <div class="space-y-3">
      <ProgressBar label="Day" :value="dayProgress" />
      <ProgressBar label="Week" :value="weekProgress" />
      <ProgressBar label="Month" :value="monthProgress" />
      <ProgressBar label="Year" :value="yearProgress" />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const now = inject(NOW_INJECTION_KEY)!
const { dayProgress, weekProgress, monthProgress, yearProgress } = useProgress(now)
</script>
