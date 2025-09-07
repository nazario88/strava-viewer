<template>
  <div class="relative overflow-hidden">
    <!-- Desktop : Heatmap complète (52 semaines) -->
    <div class="hidden lg:block">
      <div class="flex mb-2">
        <div class="w-6"></div>
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

      <div class="flex">
        <div class="w-6 flex flex-col" style="gap: 2px;">
          <div v-for="day in dayLabels" :key="day" class="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center pr-1" style="height: 10px;">
            {{ day }}
          </div>
        </div>

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
                <div v-if="week[dayOfWeek - 1] && week[dayOfWeek - 1].count > 0" class="w-full h-full flex items-center justify-center">
                  <component :is="getActivityIcon(week[dayOfWeek - 1].activities[0]?.type)" style="width: 6px; height: 6px;" class="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet : 2 blocs semestriels -->
    <div class="lg:hidden space-y-6">
      <!-- Premier semestre -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Premier semestre</h4>
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
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">Second semestre</h4>
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

// En-têtes pour desktop (12 mois)
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

// En-têtes premier semestre (6 mois)
const firstSemesterHeaders = computed(() => {
  return [
    { name: 'Oct', weeks: 4 },
    { name: 'Nov', weeks: 4 },
    { name: 'Déc', weeks: 5 },
    { name: 'Jan', weeks: 4 },
    { name: 'Fév', weeks: 4 },
    { name: 'Mar', weeks: 5 }
  ]
})

// En-têtes second semestre (6 mois)
const secondSemesterHeaders = computed(() => {
  return [
    { name: 'Avr', weeks: 4 },
    { name: 'Mai', weeks: 4 },
    { name: 'Jun', weeks: 4 },
    { name: 'Jul', weeks: 5 },
    { name: 'Aoû', weeks: 4 },
    { name: 'Sep', weeks: 5 }
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