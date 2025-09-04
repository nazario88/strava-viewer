<template>
  <div class="relative">
    <!-- En-têtes des mois -->
    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
      <span v-for="month in monthHeaders" :key="month" class="text-center">
        {{ month }}
      </span>
    </div>

    <!-- Grille principale -->
    <div class="grid grid-cols-53 gap-1">
      <!-- Ligne des jours de la semaine -->
      <div class="col-span-1"></div> <!-- Espace vide -->
      <div v-for="week in 52" :key="week" class="text-xs text-gray-500 text-center">
        {{ week % 4 === 1 ? dayLabels[Math.floor(week/4) % 7] : '' }}
      </div>
      
      <!-- Grille des activités organisée par semaines -->
      <template v-for="(week, weekIndex) in organizedWeeks" :key="weekIndex">
        <!-- Jour de la semaine (lundi, mardi, etc.) -->
        <div v-if="weekIndex % 7 === 0" class="text-xs text-gray-500 text-right pr-1">
          {{ dayLabels[Math.floor(weekIndex/7) % 7] }}
        </div>
        
        <!-- Cases des jours -->
        <div 
          v-for="(day, dayIndex) in week" 
          :key="`${weekIndex}-${dayIndex}`"
          class="w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
          :class="getDayClasses(day)"
          :title="getDayTooltip(day)"
        >
          <!-- Icône d'activité si il y en a une -->
          <div v-if="day && day.count > 0 && day.activities && day.activities.length > 0" class="w-full h-full flex items-center justify-center">
            <component :is="getActivityIcon(day.activities[0].type)" class="w-2 h-2 text-white" />
          </div>
        </div>
      </template>
    </div>
    
    <!-- Légende -->
    <div class="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
      <span>Moins</span>
      <div class="flex items-center space-x-1">
        <div class="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
        <div class="w-3 h-3 bg-green-200 rounded-sm"></div>
        <div class="w-3 h-3 bg-green-400 rounded-sm"></div>
        <div class="w-3 h-3 bg-green-600 rounded-sm"></div>
        <div class="w-3 h-3 bg-green-800 rounded-sm"></div>
      </div>
      <span>Plus</span>
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
const monthHeaders = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

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

// Organiser les données en semaines pour un affichage correct
const organizedWeeks = computed(() => {
  if (!props.yearlyActivities || props.yearlyActivities.length === 0) return []
  
  const weeks = []
  const currentYear = new Date().getFullYear()
  
  // Commencer au premier lundi de l'année
  const firstDay = new Date(currentYear, 0, 1)
  const firstMonday = new Date(firstDay)
  const dayOfWeek = firstDay.getDay()
  const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  firstMonday.setDate(firstDay.getDate() + daysToMonday)
  
  // Créer 53 semaines de 7 jours
  for (let week = 0; week < 53; week++) {
    const weekDays = []
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(firstMonday)
      currentDate.setDate(firstMonday.getDate() + (week * 7) + day)
      
      if (currentDate.getFullYear() === currentYear) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const dayData = props.yearlyActivities.find(activity => activity.date === dateStr)
        weekDays.push(dayData || { date: dateStr, count: 0, activities: [] })
      } else {
        weekDays.push(null) // Jour hors de l'année courante
      }
    }
    weeks.push(weekDays)
  }
  
  return weeks
})

const getActivityIcon = (activityType) => {
  return activityIcons[activityType] || GenericIcon
}

const getDayClasses = (day) => {
  if (!day) return 'opacity-25' // Jours hors année
  
  const baseClasses = 'border border-gray-300 dark:border-gray-600'
  
  if (day.count === 0) {
    return `${baseClasses} bg-gray-200 dark:bg-gray-700`
  }
  
  // Intensité basée sur le nombre d'activités
  if (day.count === 1) {
    return `${baseClasses} bg-green-200 hover:bg-green-300`
  } else if (day.count === 2) {
    return `${baseClasses} bg-green-400 hover:bg-green-500`
  } else if (day.count === 3) {
    return `${baseClasses} bg-green-600 hover:bg-green-700`
  } else {
    return `${baseClasses} bg-green-800 hover:bg-green-900`
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