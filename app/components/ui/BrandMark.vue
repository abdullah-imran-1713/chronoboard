<template>
  <img
    class="cb-brand-mark"
    src="/icons/chronoboard-mark-512.png"
    alt=""
    width="512"
    height="512"
    decoding="async"
    :draggable="false"
  >
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: true })
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
