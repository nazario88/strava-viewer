<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 transition-colors">{{ title }}</h3>
    <div class="relative">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>