<template>
  <div
    v-if="isAuthenticated"
    class="fixed bottom-6 right-6 z-50"
  >
    <!-- Tooltip -->
    <div
      v-if="showTooltip"
      class="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none"
    >
      {{ tooltipText }}
      <div class="absolute top-full right-4 w-0 h-0" style="border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #111827;"></div>
    </div>

    <!-- Bouton -->
    <button
      @click="captureAndDownload"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      :disabled="isCapturing"
      class="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl rounded-full px-4 py-2.5 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-wait"
    >
      <!-- Spinner quand capture en cours -->
      <svg
        v-if="isCapturing"
        class="w-4 h-4 animate-spin text-strava"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>

      <!-- Icône appareil photo -->
      <svg
        v-else
        class="w-4 h-4 text-strava"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>

      <span>{{ isCapturing ? 'Capture...' : 'Partager' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  athleteName: {
    type: String,
    default: ''
  }
})

const isCapturing = ref(false)
const showTooltip = ref(false)
const tooltipText = ref('Télécharger en PNG')

const captureAndDownload = async () => {
  if (isCapturing.value) return
  isCapturing.value = true
  showTooltip.value = false

  try {
    // Import dynamique pour ne pas alourdir le bundle initial
    const html2canvas = (await import('html2canvas')).default

    // Cibler le main du dashboard
    const target = document.querySelector('main') || document.body

    const canvas = await html2canvas(target, {
      backgroundColor: document.documentElement.classList.contains('dark')
        ? '#111827'
        : '#fdf5ef',
      scale: 2,           // Haute résolution
      useCORS: true,      // Pour les images cross-origin (avatar Strava)
      allowTaint: false,
      logging: false,
      removeContainer: true,
      // Ignorer le bouton flottant lui-même
      ignoreElements: (el) => el.classList?.contains('share-button-ignore')
    })

    // Télécharger
    const link = document.createElement('a')
    const athleteSuffix = props.athleteName
      ? `-${props.athleteName.toLowerCase().replace(/\s+/g, '-')}`
      : ''
    const date = new Date().toISOString().split('T')[0]
    link.download = `strava-stats${athleteSuffix}-${date}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()

    tooltipText.value = '✓ Téléchargé !'
    showTooltip.value = true
    setTimeout(() => {
      tooltipText.value = 'Télécharger en PNG'
      showTooltip.value = false
    }, 2500)
  } catch (err) {
    console.error('Erreur capture :', err)
    tooltipText.value = 'Erreur, réessaie'
    showTooltip.value = true
    setTimeout(() => {
      tooltipText.value = 'Télécharger en PNG'
      showTooltip.value = false
    }, 2500)
  } finally {
    isCapturing.value = false
  }
}
</script>
