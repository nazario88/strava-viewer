<template>
  <div v-if="sports.length > 1" class="flex items-center gap-2 flex-wrap mb-6">
    <span class="text-sm text-gray-500 dark:text-gray-400 mr-1 transition-colors">Sport :</span>

    <button
      type="button"
      @click="$emit('update:modelValue', 'all')"
      class="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
      :class="modelValue === 'all'
        ? 'bg-strava text-white border-transparent'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'"
    >
      Tous
    </button>

    <button
      v-for="sport in sports"
      :key="sport"
      type="button"
      @click="$emit('update:modelValue', sport)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors"
      :class="modelValue === sport
        ? 'bg-strava text-white border-transparent'
        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'"
    >
      <span
        class="w-2 h-2 rounded-full"
        :style="{ backgroundColor: modelValue === sport ? '#ffffff' : getActivityColor(sport) }"
      />
      {{ getActivityLabel(sport) }}
    </button>
  </div>
</template>

<script setup>
import { getActivityColor, getActivityLabel } from '../../activityTypes'

defineProps({
  sports: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    default: 'all'
  }
})

defineEmits(['update:modelValue'])
</script>
