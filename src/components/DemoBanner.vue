<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 transition-colors">
    <div class="flex items-start gap-3">
      <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p class="text-sm text-amber-900 dark:text-amber-200 transition-colors">
        <strong class="font-semibold">Mode démonstration</strong> — ces données sont fictives.
        Connectez-vous pour visualiser vos propres activités.
      </p>
    </div>

    <button
      @click="$emit('connectToStrava')"
      class="flex-shrink-0 flex items-center justify-center gap-2 bg-strava hover:bg-orange-600 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-colors"
    >
      <StravaIcon class="w-4 h-4" />
      Se connecter
    </button>
  </div>
</template>

<script setup>
import StravaIcon from './icons/StravaIcon.vue'

defineEmits(['connectToStrava'])
</script>
