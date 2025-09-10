<template>
  <div class="relative overflow-hidden">
    <!-- 2 blocs semestriels -->
    <div class="space-y-6">
      <!-- Premier semestre -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">{{ firstSemesterTitle }}</h4>
        <div class="flex mb-2">
          <div class="w-8"></div>
          <div class="flex-1 flex">
            <div 
              v-for="(monthData, index) in firstSemesterHeaders" 
              :key="index"
              class="text-xs text-gray-400 dark:text-gray-500 text-left flex-shrink-0"
              :style="{ width: `${monthData.weeks * 16}px` }"
            >
              {{ monthData.name }}
            </div>
          </div>
        </div>

        <div class="flex">
          <div class="w-8 flex flex-col" style="gap: 3px;">
            <div v-for="day in dayLabels" :key="day" class="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center pr-1" style="height: 14px;">
              {{ day }}
            </div>
          </div>

          <div class="flex-1">
            <div class="flex flex-col" style="gap: 3px;">
              <div v-for="dayOfWeek in 7" :key="dayOfWeek" class="flex" style="gap: 3px;">
                <div 
                  v-for="(week, weekIndex) in firstSemesterData" 
                  :key="weekIndex"
                  class="rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 flex-shrink-0"
                  :class="getDayClasses(week[dayOfWeek - 1])"
                  :title="getDayTooltip(week[dayOfWeek - 1])"
                  style="width: 14px; height: 14px;"
                >
                  <div v-if="week[dayOfWeek - 1] && week[dayOfWeek - 1].count > 0" class="w-full h-full flex items-center justify-center">
                    <component :is="getActivityIcon(week[dayOfWeek - 1].activities[0]?.type)" style="width: 8px; height: 8px;" class="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Second semestre -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">{{ secondSemesterTitle  }}</h4>
        <div class="flex mb-2">
          <div class="w-8"></div>
          <div class="flex-1 flex">
            <div 
              v-for="(monthData, index) in secondSemesterHeaders" 
              :key="index"
              class="text-xs text-gray-400 dark:text-gray-500 text-left flex-shrink-0"
              :style="{ width: `${monthData.weeks * 16}px` }"
            >
              {{ monthData.name }}
            </div>
          </div>
        </div>

        <div class="flex">
          <div class="w-8 flex flex-col" style="gap: 3px;">
            <div v-for="day in dayLabels" :key="day" class="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center pr-1" style="height: 14px;">
              {{ day }}
            </div>
          </div>

          <div class="flex-1">
            <div class="flex flex-col" style="gap: 3px;">
              <div v-for="dayOfWeek in 7" :key="dayOfWeek" class="flex" style="gap: 3px;">
                <div 
                  v-for="(week, weekIndex) in secondSemesterData" 
                  :key="weekIndex"
                  class="rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 flex-shrink-0"
                  :class="getDayClasses(week[dayOfWeek - 1])"
                  :title="getDayTooltip(week[dayOfWeek - 1])"
                  style="width: 14px; height: 14px;"
                >
                  <div v-if="week[dayOfWeek - 1] && week[dayOfWeek - 1].count > 0" class="w-full h-full flex items-center justify-center">
                    <component :is="getActivityIcon(week[dayOfWeek - 1].activities[0]?.type)" style="width: 8px; height: 8px;" class="text-white" />
                  </div>
                </div>
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
  
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (51 * 7))
  
  const dayOfWeek = startDate.getDay()
  if (dayOfWeek !== 0) {
    startDate.setDate(startDate.getDate() - dayOfWeek)
  }
  
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

// Premier semestre (semaines 0-25)
const firstSemesterData = computed(() => {
  return weeklyData.value.slice(0, 26)
})

// Second semestre (semaines 26-51)  
const secondSemesterData = computed(() => {
  return weeklyData.value.slice(26, 52)
})

const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// En-têtes dynamiques basées sur les vraies semaines
const firstSemesterHeaders = computed(() => {
  if (!weeklyData.value || weeklyData.value.length === 0) return []
  
  const headers = []
  let currentMonth = null
  let weekCount = 0
  
  // Analyser les 26 premières semaines
  for (let weekIndex = 0; weekIndex < 26 && weekIndex < weeklyData.value.length; weekIndex++) {
    const week = weeklyData.value[weekIndex]
    const firstDayOfWeek = week.find(day => day && day.date)
    
    if (firstDayOfWeek) {
      const date = new Date(firstDayOfWeek.date)
      const month = date.getMonth()
      
      if (currentMonth !== month) {
        if (currentMonth !== null && weekCount > 0) {
          headers.push({
            name: monthNames[currentMonth],
            weeks: weekCount
          })
        }
        currentMonth = month
        weekCount = 1
      } else {
        weekCount++
      }
    }
  }
  
  // Ajouter le dernier mois
  if (currentMonth !== null && weekCount > 0) {
    headers.push({
      name: monthNames[currentMonth],
      weeks: weekCount
    })
  }
  
  return headers
})

const secondSemesterHeaders = computed(() => {
  if (!weeklyData.value || weeklyData.value.length === 0) return []
  
  const headers = []
  let currentMonth = null
  let weekCount = 0
  
  // Analyser les 26 dernières semaines (semaines 26-51)
  for (let weekIndex = 26; weekIndex < 52 && weekIndex < weeklyData.value.length; weekIndex++) {
    const week = weeklyData.value[weekIndex]
    const firstDayOfWeek = week.find(day => day && day.date)
    
    if (firstDayOfWeek) {
      const date = new Date(firstDayOfWeek.date)
      const month = date.getMonth()
      
      if (currentMonth !== month) {
        if (currentMonth !== null && weekCount > 0) {
          headers.push({
            name: monthNames[currentMonth],
            weeks: weekCount
          })
        }
        currentMonth = month
        weekCount = 1
      } else {
        weekCount++
      }
    }
  }
  
  // Ajouter le dernier mois
  if (currentMonth !== null && weekCount > 0) {
    headers.push({
      name: monthNames[currentMonth],
      weeks: weekCount
    })
  }
  
  return headers
})

const firstSemesterTitle = computed(() => {
  if (!firstSemesterData.value.length) return ''
  
  const firstWeek = firstSemesterData.value[0]
  const lastWeek = firstSemesterData.value[firstSemesterData.value.length - 1]
  
  const startDate = firstWeek.find(day => day && day.date)?.date
  const endDate = lastWeek.find(day => day && day.date)?.date
  
  if (startDate && endDate) {
    const start = new Date(startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    const end = new Date(endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    return `${start} - ${end}`
  }
  return 'Premier semestre'
})

const secondSemesterTitle = computed(() => {
  if (!secondSemesterData.value.length) return ''
  
  const firstWeek = secondSemesterData.value[0]
  const lastWeek = secondSemesterData.value[secondSemesterData.value.length - 1]
  
  const startDate = firstWeek.find(day => day && day.date)?.date
  const endDate = lastWeek.find(day => day && day.date)?.date
  
  if (startDate && endDate) {
    const start = new Date(startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    const end = new Date(endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    return `${start} - ${end}`
  }
  return 'Second semestre'
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