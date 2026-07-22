<template>
  <img
    class="cb-brand-mark"
    src="/icons/chronoboard-mark-512.png"
    alt=""
    width="512"
    height="512"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
    :draggable="false"
  >
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: true })

withDefaults(defineProps<{
  decoding?: 'async' | 'sync' | 'auto'
  fetchpriority?: 'high' | 'low' | 'auto'
}>(), {
  decoding: 'async',
  fetchpriority: 'auto',
})
</script>

<style scoped>
.cb-brand-mark {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
