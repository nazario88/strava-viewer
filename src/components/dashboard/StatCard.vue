<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
    <div class="flex items-center">
      <div :class="iconClasses">
        <component :is="iconComponent" class="w-6 h-6" />
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">{{ title }}</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white transition-colors">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TrendIcon from '../icons/TrendIcon.vue'
import ChartIcon from '../icons/ChartIcon.vue'
import HeartIcon from '../icons/HeartIcon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  }
})

const iconComponent = computed(() => {
  const icons = {
    'trend': TrendIcon,
    'chart': ChartIcon,
    'heart': HeartIcon
  }
  return icons[props.icon] || TrendIcon
})

const iconClasses = computed(() => {
  const baseClasses = 'p-2 rounded-lg'
  const colorClasses = {
    //'blue': 'bg-blue-100 text-blue-600',
    //'green': 'bg-green-100 text-green-600',
    'strava': 'bg-strava/10 text-strava'
  }
  return `${baseClasses} ${colorClasses[props.color] || colorClasses.blue}`
})
</script>