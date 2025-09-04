<template>
  <div class="flex justify-center items-center h-64">
    <div class="flex flex-col items-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-strava"></div>
      <p class="text-sm text-gray-500 dark:text-gray-400 transition-colors">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Chargement en cours...'
  }
})
</script>