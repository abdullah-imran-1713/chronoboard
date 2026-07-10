<template>
  <div
    v-if="widgetStore.activeWidgets.length > 0"
    class="w-full max-w-4xl mx-auto mt-8 px-4"
  >
    <div
      class="grid gap-4"
      :style="{
        gridTemplateColumns: `repeat(${layoutStore.widgetColumns}, minmax(0, 1fr))`,
        gap: layoutStore.widgetGap,
      }"
    >
      <component
        :is="resolveWidget(widget.component)"
        v-for="widget in widgetStore.activeWidgets"
        :key="widget.id"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const widgetStore = useWidgetStore()
const layoutStore = useLayoutStore()

const widgetModules = import.meta.glob('./*Widget.vue')
const componentCache = new Map<string, Component>()

function resolveWidget(componentName: string): Component | null {
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!
  }

  const path = `./${componentName}.vue`
  const loader = widgetModules[path]
  if (!loader) {
    if (import.meta.dev) {
      console.warn(`[WidgetGrid] Missing component: ${componentName}`)
    }
    return null
  }

  const asyncComponent = defineAsyncComponent(loader as () => Promise<Component>)
  componentCache.set(componentName, asyncComponent)
  return asyncComponent
}
</script>
