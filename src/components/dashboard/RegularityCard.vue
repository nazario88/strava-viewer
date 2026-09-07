<template>
  <div class="h-80 flex flex-col justify-between py-2">
    <!-- Trois chiffres de tête -->
    <div class="grid grid-cols-3 gap-4">
      <div>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
          {{ regularity.activeWeeks }}<span class="text-gray-400 dark:text-gray-500 text-lg">/{{ regularity.totalWeeks }}</span>
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">semaines actives</p>
      </div>
      <div>
        <p class="text-2xl font-semibold transition-colors" :style="{ color }">
          {{ regularity.currentStreak }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
          {{ regularity.currentStreak > 1 ? 'semaines d\'affilée' : 'semaine d\'affilée' }}
        </p>
      </div>
      <div>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">
          {{ averageGapLabel }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">entre deux séances</p>
      </div>
    </div>

    <!-- Bande des 12 semaines : l'intensité traduit le nombre de séances -->
    <div>
      <div class="flex gap-1.5 mb-2">
        <div
          v-for="(count, index) in regularity.weeks"
          :key="index"
          class="flex-1 rounded transition-transform duration-100 hover:scale-110"
          :class="count === 0 ? 'bg-gray-100 dark:bg-gray-700' : ''"
          :style="cellStyle(count)"
          :title="cellTooltip(count, index)"
        />
      </div>
      <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 transition-colors">
        <span>S-{{ regularity.totalWeeks - 1 }}</span>
        <span>Cette sem.</span>
      </div>
    </div>

    <!-- Lecture en clair, sinon les chiffres restent muets -->
    <p class="text-sm text-gray-600 dark:text-gray-300 transition-colors">
      {{ verdict }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { hexToRgba } from '../../activityTypes'

const props = defineProps({
  regularity: {
    type: Object,
    required: true
  },
  color: {
    type: String,
    default: '#FC4C02'
  }
})

// Plus il y a de séances dans la semaine, plus la case est dense.
const cellColor = (count) => {
  if (count >= 3) return props.color
  if (count === 2) return hexToRgba(props.color, 0.7)
  return hexToRgba(props.color, 0.4)
}

// Hauteur fixe, seule la couleur varie. Les semaines vides gardent le fond
// defini par la classe, d'ou l'absence de backgroundColor ici.
const cellStyle = (count) => {
  const style = { height: '56px' }
  if (count > 0) style.backgroundColor = cellColor(count)
  return style
}

const cellTooltip = (count, index) => {
  const weeksAgo = props.regularity.totalWeeks - 1 - index
  const week = weeksAgo === 0 ? 'Cette semaine' : `Il y a ${weeksAgo} semaine${weeksAgo > 1 ? 's' : ''}`
  if (count === 0) return `${week} — aucune séance`
  return `${week} — ${count} séance${count > 1 ? 's' : ''}`
}

const averageGapLabel = computed(() => {
  const gap = props.regularity.averageGapDays
  if (gap === null || gap === undefined) return '—'
  // Au-dela de dix jours, la decimale est un faux niveau de precision.
  if (gap >= 10) return `${Math.round(gap)} j`
  return `${gap.toFixed(1)} j`
})

const verdict = computed(() => {
  const { activeWeeks, totalWeeks, bestStreak } = props.regularity
  const ratio = activeWeeks / totalWeeks

  if (activeWeeks === 0) return 'Aucune séance sur la période.'
  if (ratio >= 0.9) return 'Rythme très régulier : presque aucune semaine sautée.'
  if (ratio >= 0.7) return `Rythme régulier, avec quelques semaines creuses. Meilleure série : ${bestStreak} semaines.`
  if (ratio >= 0.4) return `Rythme irrégulier : un peu moins d'une semaine sur deux. Meilleure série : ${bestStreak} semaines.`
  return 'Pratique occasionnelle sur cette période.'
})
</script>
