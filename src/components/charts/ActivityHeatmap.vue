<template>
  <div class="w-full">
    <!-- Grille 6 mois : 3×2 desktop, 2×3 tablette, 1×6 mobile -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="month in calendarMonths"
        :key="month.key"
        class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
      >
        <!-- En-tête du mois -->
        <div class="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 text-center">
          {{ month.label }}
        </div>

        <!-- Jours de la semaine -->
        <div class="grid grid-cols-7 mb-1">
          <div
            v-for="d in DAY_LABELS"
            :key="d"
            class="text-center text-gray-400 dark:text-gray-500"
            style="font-size: 9px; line-height: 16px;"
          >
            {{ d }}
          </div>
        </div>

        <!-- Cases du calendrier -->
        <div class="grid grid-cols-7" style="gap: 3px;">
          <!-- Décalage du premier jour (lundi = 0) -->
          <div
            v-for="n in month.startOffset"
            :key="`offset-${month.key}-${n}`"
            style="height: 16px;"
          />

          <!-- Jours du mois -->
          <div
            v-for="day in month.days"
            :key="day.date"
            class="rounded-sm cursor-default transition-transform duration-100 hover:scale-125 relative flex items-center justify-center"
            :class="day.count === 0 ? 'bg-gray-200 dark:bg-gray-600' : ''"
            :style="day.count > 0 ? { backgroundColor: getActivityColor(day.mainType) } : {}"
            :title="getDayTooltip(day)"
            style="height: 16px;"
          >
            <!-- Point blanc discret si activité -->
            <div
              v-if="day.count > 0"
              class="rounded-full bg-white"
              style="width: 4px; height: 4px; opacity: 0.7;"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Légende -->
    <div class="flex items-center justify-center gap-3 mt-4 flex-wrap">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-600"></div>
        <span class="text-xs text-gray-400 dark:text-gray-500">Aucune activité</span>
      </div>
      <div
        v-for="item in legendItems"
        :key="item.type"
        class="flex items-center gap-1.5"
      >
        <div class="w-3 h-3 rounded-sm flex items-center justify-center" :style="{ backgroundColor: item.color }">
          <div class="rounded-full bg-white" style="width: 4px; height: 4px; opacity: 0.7;"/>
        </div>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  yearlyActivities: {
    type: Array,
    required: true
  }
})

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const ACTIVITY_COLORS = {
  'Run':              '#FC4C02',
  'TrailRun':         '#E03D00',
  'VirtualRun':       '#FF6B35',
  'Ride':             '#22C55E',
  'VirtualRide':      '#16A34A',
  'MountainBikeRide': '#15803D',
  'GravelRide':       '#4ADE80',
  'Swim':             '#02B1FC',
  'OpenWaterSwim':    '#0284C7',
  'Walk':             '#A78BFA',
  'Hike':             '#7C3AED',
  'WeightTraining':   '#F59E0B',
  'Workout':          '#D97706',
  'Yoga':             '#FCD34D',
  'default':          '#9CA3AF'
}

const ACTIVITY_LABELS = {
  'Run':              'Course',
  'TrailRun':         'Trail',
  'VirtualRun':       'Course virtuelle',
  'Ride':             'Vélo',
  'VirtualRide':      'Vélo virtuel',
  'MountainBikeRide': 'VTT',
  'GravelRide':       'Gravel',
  'Swim':             'Natation',
  'OpenWaterSwim':    'Nage en eau libre',
  'Walk':             'Marche',
  'Hike':             'Randonnée',
  'WeightTraining':   'Musculation',
  'Workout':          'Entraînement',
  'Yoga':             'Yoga',
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

// Index date → activité pour lookup O(1)
const activitiesIndex = computed(() => {
  const index = {}
  props.yearlyActivities?.forEach(a => { index[a.date] = a })
  return index
})

// 6 mois glissants (du plus ancien au plus récent)
const calendarMonths = computed(() => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const months = []
  const currentYear = new Date().getFullYear()

  for (let i = 5; i >= 0; i--) {
    const refDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = refDate.getFullYear()
    const month = refDate.getMonth()

    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Offset lundi=0 : (getDay() + 6) % 7
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7

    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d, 12)
      if (dayDate > today) break

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const activityData = activitiesIndex.value[dateStr]
      const mainType = activityData?.activities?.[0]?.type || null

      days.push({
        date: dateStr,
        day: d,
        count: activityData?.count || 0,
        activities: activityData?.activities || [],
        mainType
      })
    }

    const yearSuffix = year !== currentYear ? ` ${year}` : ''
    months.push({
      key: `${year}-${month}`,
      label: `${MONTH_NAMES[month]}${yearSuffix}`,
      year,
      month,
      startOffset,
      days
    })
  }

  return months
})

const getActivityColor = (type) => {
  if (!type) return ACTIVITY_COLORS['default']
  return ACTIVITY_COLORS[type] || ACTIVITY_COLORS['default']
}

const getDayTooltip = (day) => {
  const dateObj = new Date(day.date + 'T12:00:00')
  const dateLabel = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  if (day.count === 0) return `${dateLabel} — Aucune activité`
  const list = day.activities
    .map(a => `${a.type}${a.distance ? ` (${a.distance} km)` : ''}`)
    .join(', ')
  return `${dateLabel} — ${day.count} activité(s) : ${list}`
}

// Légende : types réellement présents dans les 6 derniers mois, triés par fréquence
const legendItems = computed(() => {
  const typeCounts = {}
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  props.yearlyActivities?.forEach(a => {
    if (new Date(a.date) >= sixMonthsAgo) {
      a.activities?.forEach(act => {
        typeCounts[act.type] = (typeCounts[act.type] || 0) + 1
      })
    }
  })

  return Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => ({
      type,
      label: ACTIVITY_LABELS[type] || type,
      color: getActivityColor(type)
    }))
})
</script>
