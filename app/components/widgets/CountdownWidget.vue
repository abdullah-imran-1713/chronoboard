<template>
  <BaseCard title="Countdown" icon="mdi:clock-end">
    <div class="space-y-3">
      <div>
        <label
          class="block text-xs font-ui mb-1"
          :style="{ color: 'var(--color-muted)' }"
        >
          Target date & time
        </label>
        <input
          v-model="targetInput"
          type="datetime-local"
          class="w-full px-3 py-2 rounded-lg text-sm font-ui border-none outline-none"
          :style="{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
          }"
          @change="applyTarget"
        >
      </div>

      <div v-if="remaining" class="text-center space-y-1">
        <p
          v-if="remaining.finished"
          class="text-xl font-bold font-ui"
          :style="{ color: 'var(--color-primary)' }"
        >
          Finished!
        </p>
        <template v-else>
          <p
            class="text-2xl font-clock tabular-nums"
            :style="{ color: 'var(--color-primary)' }"
          >
            {{ remaining.days }}d {{ remaining.hours }}h {{ remaining.minutes }}m {{ remaining.seconds }}s
          </p>
          <p class="text-xs font-ui" :style="{ color: 'var(--color-muted)' }">
            remaining
          </p>
        </template>
      </div>

      <p
        v-else
        class="text-sm font-ui text-center"
        :style="{ color: 'var(--color-muted)' }"
      >
        Set a target date above
      </p>

      <div v-if="targetDate" class="flex justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-ui"
          :style="mutedButtonStyle"
          @click="clearTarget"
        >
          Clear
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const { remaining, targetDate, setTarget, clear } = useCountdown()
const targetInput = ref('')

const mutedButtonStyle = {
  backgroundColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)',
  color: 'var(--color-text)',
}

function applyTarget() {
  if (!targetInput.value) return
  setTarget(new Date(targetInput.value))
}

function clearTarget() {
  targetInput.value = ''
  clear()
}
</script>
