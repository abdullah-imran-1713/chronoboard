<template>
  <BaseCard title="Focus" icon="mdi:timer-outline">
    <!-- Setup: title, duration, optional break, saved sessions -->
    <div v-if="isSetup" class="focus-setup space-y-3">
      <p
        class="text-xs font-ui uppercase tracking-wider text-center m-0"
        :style="{ color: 'var(--color-muted)' }"
      >
        Set up
      </p>

      <input
        v-model="taskDraft"
        type="text"
        class="focus-task-input w-full px-3 py-2 rounded-lg text-sm font-ui border-none outline-none text-center"
        maxlength="48"
        placeholder="What are you focusing on?"
        :style="fieldStyle"
        aria-label="Focus title"
        @change="commitTask"
        @keydown.enter.prevent="commitTask"
      >

      <label class="focus-duration focus-duration--solo">
        <span class="focus-duration-label">Focus length</span>
        <CbHint :text="focusRangeHint">
          <div class="focus-duration-ctrl">
            <input
              :value="focusMinutes"
              type="number"
              inputmode="numeric"
              class="focus-duration-input"
              :aria-label="`Focus minutes (${focusRangeHint})`"
              @change="onFocusMinutesChange"
              @blur="onFocusMinutesChange"
            >
            <span class="focus-duration-unit">min</span>
          </div>
        </CbHint>
      </label>

      <div class="focus-break-block">
        <BaseToggle
          v-model="breakEnabled"
          label="Break after focus"
        />
        <CbHint
          v-if="breakEnabled"
          :text="breakRangeHint"
        >
          <div class="focus-duration-ctrl mt-2">
            <input
              :value="breakMinutes"
              type="number"
              inputmode="numeric"
              class="focus-duration-input"
              :aria-label="`Break minutes (${breakRangeHint})`"
              @change="onBreakMinutesChange"
              @blur="onBreakMinutesChange"
            >
            <span class="focus-duration-unit">min</span>
          </div>
        </CbHint>
      </div>

      <div class="focus-sessions">
        <div class="focus-sessions-head">
          <span class="focus-duration-label m-0">Saved sessions</span>
          <CbHint :text="saveSessionHint" :blocked="!canSaveNow">
            <button
              type="button"
              class="focus-save-btn cb-icobtn"
              :disabled="!canSaveNow"
              aria-label="Save current session"
              @click="onSaveSession"
            >
              <Icon name="mdi:content-save-outline" size="15" />
            </button>
          </CbHint>
        </div>

        <p
          v-if="sessions.length === 0"
          class="focus-sessions-empty m-0"
        >
          Save a setup for one-tap reuse
        </p>

        <div
          v-else
          class="focus-session-list"
          role="list"
        >
          <div
            v-for="session in sessions"
            :key="session.id"
            class="focus-session-chip"
            role="listitem"
          >
            <button
              type="button"
              class="focus-session-load"
              :aria-label="`Use ${session.title}`"
              @click="loadSession(session)"
            >
              <span class="focus-session-title truncate">{{ session.title }}</span>
              <span class="focus-session-meta">
                {{ session.focusMinutes }}m
                <template v-if="session.breakEnabled">
                  · {{ session.breakMinutes }}m break
                </template>
              </span>
            </button>
            <CbHint text="Remove session">
              <button
                type="button"
                class="focus-session-remove cb-icobtn"
                :aria-label="`Remove ${session.title}`"
                @click="removeSession(session.id)"
              >
                <Icon name="mdi:close" size="14" />
              </button>
            </CbHint>
          </div>
        </div>
      </div>

      <div class="flex justify-center pt-0.5">
        <CbHint
          :text="canStart ? 'Start focus session' : 'Add a title to start'"
          :blocked="!canStart"
        >
          <button
            type="button"
            class="px-5 py-2 rounded-lg text-sm font-ui"
            :style="canStart ? buttonStyle : mutedButtonStyle"
            :disabled="!canStart"
            @click="onStart"
          >
            Start
          </button>
        </CbHint>
      </div>
    </div>

    <!-- Session: timer + progress only -->
    <div
      v-else
      class="focus-run space-y-3"
    >
      <p
        class="text-xs font-ui uppercase tracking-wider text-center m-0"
        :style="{ color: 'var(--color-muted)' }"
      >
        {{ phaseLabel }}
      </p>

      <p
        class="focus-run-title text-sm font-ui text-center m-0 truncate"
        :style="{ color: 'var(--color-text)' }"
      >
        {{ progressLabel }}
      </p>

      <p
        class="text-3xl font-clock text-center tabular-nums m-0"
        :style="{ color: 'var(--color-primary)' }"
      >
        {{ display }}
      </p>

      <ProgressBar :label="phase === 'break' ? 'Break' : 'Progress'" :value="progress" />

      <div class="flex gap-2 justify-center">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-ui"
          :style="buttonStyle"
          @click="running ? pause() : start()"
        >
          {{ running ? 'Pause' : 'Resume' }}
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-sm font-ui"
          :style="mutedButtonStyle"
          @click="reset()"
        >
          Reset
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
const {
  phase,
  phaseLabel,
  progressLabel,
  display,
  progress,
  running,
  isSetup,
  canStart,
  focusMinutes,
  breakMinutes,
  breakEnabled,
  taskLabel,
  sessions,
  canSaveSession,
  applyFocusDuration,
  applyBreakDuration,
  loadSession,
  saveCurrentSession,
  removeSession,
  start,
  pause,
  reset,
  MIN_FOCUS_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_BREAK_MINUTES,
  MAX_BREAK_MINUTES,
} = usePomodoro()

const taskDraft = ref(taskLabel.value)
const saveFlash = ref('')

const focusRangeHint = computed(
  () => `${MIN_FOCUS_MINUTES}–${MAX_FOCUS_MINUTES} minutes`,
)
const breakRangeHint = computed(
  () => `${MIN_BREAK_MINUTES}–${MAX_BREAK_MINUTES} minutes`,
)

const canSaveNow = computed(() =>
  canSaveSession.value && taskLabel.value.trim().length > 0,
)

const saveSessionHint = computed(() => {
  if (saveFlash.value) return saveFlash.value
  if (!taskLabel.value.trim()) return 'Add a title before saving'
  if (!canSaveSession.value) return 'Session limit reached'
  return 'Save this setup'
})

watch(taskLabel, (value) => {
  if (value !== taskDraft.value) taskDraft.value = value
})

function commitTask() {
  taskLabel.value = taskDraft.value.trim()
  taskDraft.value = taskLabel.value
}

function onFocusMinutesChange(event: Event) {
  const el = event.target as HTMLInputElement
  applyFocusDuration(Number(el.value) || MIN_FOCUS_MINUTES)
  el.value = String(focusMinutes.value)
}

function onBreakMinutesChange(event: Event) {
  const el = event.target as HTMLInputElement
  applyBreakDuration(Number(el.value) || MIN_BREAK_MINUTES)
  el.value = String(breakMinutes.value)
}

function onStart() {
  commitTask()
  start()
}

function onSaveSession() {
  commitTask()
  const result = saveCurrentSession()
  if (!result.ok) {
    saveFlash.value = result.reason === 'title'
      ? 'Add a title before saving'
      : 'Session limit reached'
  }
  else {
    saveFlash.value = result.updated ? 'Updated' : 'Saved'
  }
  window.setTimeout(() => {
    saveFlash.value = ''
  }, 1600)
}

const fieldStyle = {
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
}

const buttonStyle = {
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-bg)',
}

const mutedButtonStyle = {
  backgroundColor: 'rgba(var(--color-muted-rgb), 0.3)',
  color: 'var(--color-text)',
}
</script>

<style scoped>
.focus-task-input::placeholder {
  color: var(--color-muted);
  opacity: 0.85;
}

.focus-duration {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.focus-duration--solo :deep(.cb-hint),
.focus-break-block :deep(.cb-hint) {
  width: 100%;
}

.focus-duration--solo :deep(.cb-hint-target),
.focus-break-block :deep(.cb-hint-target) {
  width: 100%;
  display: block;
}

.focus-duration-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-muted);
  font-family: inherit;
}

.focus-duration-ctrl {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  border-radius: 0.55rem;
  background: var(--color-bg);
  width: 100%;
  box-sizing: border-box;
}

.focus-duration-input {
  width: 100%;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  padding: 0;
}

.focus-duration-input::-webkit-outer-spin-button,
.focus-duration-input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.focus-duration-input[type='number'] {
  appearance: textfield;
}

.focus-duration-unit {
  flex: none;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.focus-break-block {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.focus-sessions {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.focus-sessions-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.focus-save-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  background: rgba(var(--color-muted-rgb), 0.12);
  cursor: pointer;
}

.focus-save-btn:hover:not(:disabled),
.focus-save-btn:focus-visible:not(:disabled) {
  color: var(--color-text);
  background: rgba(var(--color-muted-rgb), 0.2);
  outline: none;
}

.focus-save-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.focus-sessions-empty {
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--color-muted);
  font-family: inherit;
}

.focus-session-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 7.5rem;
  overflow-y: auto;
}

.focus-session-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  border-radius: 0.55rem;
  background: rgba(var(--color-muted-rgb), 0.1);
  border: 1px solid rgba(var(--color-muted-rgb), 0.16);
}

.focus-session-load {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0.45rem 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-family: inherit;
}

.focus-session-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.focus-session-meta {
  font-size: 0.6875rem;
  color: var(--color-muted);
}

.focus-session-remove {
  flex: none;
  width: 28px;
  height: 28px;
  margin-right: 0.25rem;
  border: none;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
  background: transparent;
  cursor: pointer;
}

.focus-session-remove:hover,
.focus-session-remove:focus-visible {
  color: var(--color-text);
  background: rgba(var(--color-muted-rgb), 0.16);
  outline: none;
}

.focus-run-title {
  font-weight: 600;
  letter-spacing: 0.01em;
  max-width: 100%;
  padding: 0 0.25rem;
}
</style>
