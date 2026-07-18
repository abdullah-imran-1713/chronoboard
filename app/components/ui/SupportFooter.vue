<template>
  <div
    class="support-footer font-ui"
    role="contentinfo"
    aria-label="Support ChronoBoard"
  >
    <span class="support-footer-heart" aria-hidden="true">♥</span>
    <span class="support-footer-label">Support</span>
    <span class="support-footer-sep" aria-hidden="true">·</span>
    <a
      class="support-footer-link"
      :href="supportUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      Buy me a coffee
    </a>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const supportUrl = computed(() => String(config.public.supportUrl || '').trim())
</script>

<style scoped>
.support-footer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 0;
  padding: 0.15rem 0.35rem;
  border: none;
  background: transparent;
  box-shadow: none;
  color: var(--color-muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.2;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
}

.support-footer-heart {
  color: rgba(var(--color-primary-rgb), 0.85);
  font-size: 0.7rem;
  line-height: 1;
}

.support-footer-label {
  opacity: 0.9;
}

.support-footer-sep {
  opacity: 0.45;
}

.support-footer-link {
  color: var(--color-text);
  text-decoration: none;
  opacity: 0.78;
  border-bottom: 1px solid rgba(var(--color-muted-rgb), 0.35);
  transition: opacity 0.15s ease, border-color 0.15s ease;
}

.support-footer-link:hover,
.support-footer-link:focus-visible {
  opacity: 1;
  border-bottom-color: rgba(var(--color-primary-rgb), 0.55);
  outline: none;
}
</style>
