<template>
  <div class="min-h-screen p-8" :style="{ backgroundColor: 'var(--color-bg)' }">
    <h1 class="text-2xl font-bold mb-8 font-ui" :style="{ color: 'var(--color-text)' }">
      Analytics Dashboard
    </h1>

    <div v-if="!authenticated" class="max-w-sm mx-auto space-y-4">
      <input
        v-model="password"
        type="password"
        placeholder="Admin password"
        class="w-full px-4 py-2 rounded-lg font-ui outline-none border-none"
        :style="{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }"
        aria-label="Admin password"
        @keyup.enter="authenticate"
      >
      <p
        v-if="error"
        class="text-sm font-ui"
        :style="{ color: '#ef4444' }"
        role="alert"
      >
        {{ error }}
      </p>
      <button
        type="button"
        class="w-full py-2 rounded-lg font-bold font-ui"
        :style="{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }"
        :disabled="loading"
        @click="authenticate"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div
          class="rounded-xl p-4"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-muted) 20%, transparent)',
          }"
        >
          <p class="text-xs font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
            Visitors
          </p>
          <p class="text-3xl font-clock mt-1" :style="{ color: 'var(--color-primary)' }">
            {{ stats?.visitors ?? '—' }}
          </p>
        </div>
        <div
          class="rounded-xl p-4"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--color-surface) 80%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-muted) 20%, transparent)',
          }"
        >
          <p class="text-xs font-ui uppercase tracking-wider" :style="{ color: 'var(--color-muted)' }">
            Pageviews
          </p>
          <p class="text-3xl font-clock mt-1" :style="{ color: 'var(--color-primary)' }">
            {{ stats?.pageviews ?? '—' }}
          </p>
        </div>
      </div>

      <p class="text-sm font-ui" :style="{ color: 'var(--color-muted)' }">
        {{ stats?.message ?? 'Connect your analytics service to see data here.' }}
      </p>

      <button
        type="button"
        class="text-sm font-ui underline"
        :style="{ color: 'var(--color-muted)' }"
        @click="logout"
      >
        Log out
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const ADMIN_TOKEN_KEY = 'chronoboard_admin_token'

const password = ref('')
const authenticated = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<{ visitors: number, pageviews: number, message: string } | null>(null)

useHead({
  title: 'Admin — ChronoBoard',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return {}
  return { authorization: `Bearer ${token}` }
}

async function fetchStats() {
  stats.value = await $fetch('/api/admin/stats', {
    headers: getAuthHeaders(),
  })
}

async function authenticate() {
  loading.value = true
  error.value = null

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })
    localStorage.setItem(ADMIN_TOKEN_KEY, password.value)
    authenticated.value = true
    await fetchStats()
  } catch {
    authenticated.value = false
    error.value = 'Invalid password'
  } finally {
    loading.value = false
  }
}

async function tryRestoreSession() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return

  try {
    await $fetch('/api/admin/stats', {
      headers: { authorization: `Bearer ${token}` },
    })
    authenticated.value = true
    await fetchStats()
  } catch {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  }
}

function logout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  authenticated.value = false
  password.value = ''
  stats.value = null
}

onMounted(tryRestoreSession)
</script>
