<template>
  <div class="relative overflow-hidden">
    <!-- En-têtes des mois -->
    <div class="flex mb-2">
      <div class="w-8"></div> <!-- Espace pour les jours -->
      <div class="flex-1 flex">
        <div 
          v-for="(monthData, index) in monthHeaders" 
          :key="index"
          class="text-xs text-gray-400 dark:text-gray-500 text-left flex-shrink-0"
          :style="{ width: `${monthData.weeks * 12}px` }"
        >
          {{ monthData.name }}
        </div>
      </div>
    </div>

    <!-- Grille principale -->
    <div class="flex">
      <!-- Labels des jours de la semaine - tous affichés -->
      <div class="w-8 flex flex-col" style="gap: 2px;">
        <div v-for="day in dayLabels" :key="day" class="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center pr-1" style="height: 10px;">
          {{ day }}
        </div>
      </div>

      <!-- Grille des jours - retour à l'approche simple -->
      <div class="flex-1">
        <div class="flex flex-col" style="gap: 2px;">
          <div v-for="dayOfWeek in 7" :key="dayOfWeek" class="flex" style="gap: 2px;">
            <div 
              v-for="(week, weekIndex) in weeklyData" 
              :key="weekIndex"
              class="rounded-sm cursor-pointer transition-all duration-200 hover:scale-125 flex-shrink-0"
              :class="getDayClasses(week[dayOfWeek - 1])"
              :title="getDayTooltip(week[dayOfWeek - 1])"
              style="width: 10px; height: 10px;"
            >
              <!-- Icône d'activité -->
              <div v-if="week[dayOfWeek - 1] && week[dayOfWeek - 1].count > 0" class="w-full h-full flex items-center justify-center">
                <component :is="getActivityIcon(week[dayOfWeek - 1].activities[0]?.type)" style="width: 6px; height: 6px;" class="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import RunIcon from '../icons/activities/RunIcon.vue'
import BikeIcon from '../icons/activities/BikeIcon.vue'
import SwimIcon from '../icons/activities/SwimIcon.vue'
import HikeIcon from '../icons/activities/HikeIcon.vue'
import GenericIcon from '../icons/activities/GenericIcon.vue'

const props = defineProps({
  yearlyActivities: {
    type: Array,
    required: true
  }
})

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const activityIcons = {
  'Run': RunIcon,
  'Ride': BikeIcon,
  'VirtualRide': BikeIcon,
  'Swim': SwimIcon,
  'Hike': HikeIcon,
  'Walk': HikeIcon,
  'WeightTraining': GenericIcon,
  'Workout': GenericIcon
}

// Données des 12 derniers mois (52 semaines exactement)
const weeklyData = computed(() => {
  if (!props.yearlyActivities || props.yearlyActivities.length === 0) {
    return Array(52).fill().map(() => Array(7).fill(null))
  }
  
  const weeks = []
  const today = new Date()
  
  // Commencer il y a exactement 52 semaines
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (51 * 7)) // 52 semaines = 51 semaines + cette semaine
  
  // Aller au dimanche précédent
  const dayOfWeek = startDate.getDay()
  if (dayOfWeek !== 0) {
    startDate.setDate(startDate.getDate() - dayOfWeek)
  }
  
  // Créer exactement 52 semaines
  let currentDate = new Date(startDate)
  
  for (let weekIndex = 0; weekIndex < 52; weekIndex++) {
    const week = []
    
    for (let day = 0; day < 7; day++) {
      const dayDate = new Date(currentDate)
      dayDate.setDate(currentDate.getDate() + day)
      
      if (dayDate <= today) {
        const dateStr = dayDate.toISOString().split('T')[0]
        const dayData = props.yearlyActivities.find(activity => activity.date === dateStr)
        week.push(dayData || { date: dateStr, count: 0, activities: [] })
      } else {
        week.push(null)
      }
    }
    
    weeks.push(week)
    currentDate.setDate(currentDate.getDate() + 7)
  }
  
  return weeks
})

// En-têtes simplifiés
const monthHeaders = computed(() => {
  return [
    { name: 'Oct', weeks: 4 },
    { name: 'Nov', weeks: 4 },
    { name: 'Déc', weeks: 5 },
    { name: 'Jan', weeks: 4 },
    { name: 'Fév', weeks: 4 },
    { name: 'Mar', weeks: 4 },
    { name: 'Avr', weeks: 5 },
    { name: 'Mai', weeks: 4 },
    { name: 'Jun', weeks: 4 },
    { name: 'Jul', weeks: 5 },
    { name: 'Aoû', weeks: 4 },
    { name: 'Sep', weeks: 4 }
  ]
})

const getActivityIcon = (activityType) => {
  return activityIcons[activityType] || GenericIcon
}

const getDayClasses = (day) => {
  if (!day) return 'bg-gray-100 dark:bg-gray-800 opacity-30'
  
  if (day.count === 0) {
    return 'bg-gray-200 dark:bg-gray-700'
  } else {
    return 'bg-strava hover:bg-orange-600'
  }
}

const getDayTooltip = (day) => {
  if (!day) return ''
  
  const date = new Date(day.date).toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  if (day.count === 0) {
    return `${date} - Aucune activité`
  }
  
  const activities = day.activities.map(a => `${a.type}: ${a.distance}km`).join(', ')
  return `${date} - ${day.count} activité(s): ${activities}`
}
</script>