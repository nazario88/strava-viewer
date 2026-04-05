<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors mb-8">

    <!-- Pas d'objectif défini -->
    <div v-if="!hasGoal && !isEditing" class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-strava/10 text-strava">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">Objectif annuel</p>
          <p class="text-sm text-gray-400 dark:text-gray-500 transition-colors">Aucun objectif défini</p>
        </div>
      </div>
      <button
        @click="startEditing"
        class="flex items-center gap-1.5 text-sm text-strava hover:text-orange-600 font-medium transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 4v16m8-8H4"/>
        </svg>
        Définir un objectif
      </button>
    </div>

    <!-- Objectif défini + barre de progression -->
    <div v-else-if="hasGoal && !isEditing">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-strava/10 text-strava">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">Objectif annuel</p>
            <p class="text-sm text-gray-400 dark:text-gray-500 transition-colors">
              {{ progressLabel }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Pourcentage -->
          <span
            class="text-lg font-bold transition-colors"
            :class="isGoalReached ? 'text-green-500' : 'text-strava'"
          >
            {{ percentage }}%
          </span>
          <!-- Bouton éditer -->
          <button
            @click="startEditing"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Modifier l'objectif"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Barre de progression -->
      <div class="relative w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden transition-colors">
        <div
          class="h-3 rounded-full transition-all duration-700 ease-out"
          :class="isGoalReached ? 'bg-green-500' : 'bg-strava'"
          :style="{ width: `${Math.min(progressWidth, 100)}%` }"
        />
      </div>

      <!-- Détail sous la barre -->
      <div class="flex justify-between mt-2">
        <span class="text-xs text-gray-400 dark:text-gray-500 transition-colors">
          {{ yearlyDistance.toFixed(0) }} km parcourus
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500 transition-colors">
          {{ isGoalReached ? '🎉 Objectif atteint !' : `${remaining} km restants` }}
        </span>
      </div>
    </div>

    <!-- Mode édition inline -->
    <div v-if="isEditing" class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-strava/10 text-strava flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>

      <div class="flex items-center gap-2 flex-1">
        <label class="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap transition-colors">
          Objectif annuel :
        </label>
        <input
          ref="inputRef"
          v-model="inputValue"
          type="number"
          min="1"
          max="99999"
          placeholder="ex : 1000"
          @keydown.enter="confirmEdit"
          @keydown.escape="cancelEdit"
          class="w-32 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-strava transition-colors"
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">km</span>
      </div>

      <div class="flex items-center gap-1 flex-shrink-0">
        <!-- Valider -->
        <button
          @click="confirmEdit"
          class="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          title="Valider"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
        <!-- Annuler -->
        <button
          @click="cancelEdit"
          class="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Annuler"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <!-- Supprimer (seulement si objectif existant) -->
        <button
          v-if="hasGoal"
          @click="removeGoal"
          class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Supprimer l'objectif"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const props = defineProps({
  yearlyDistance: {
    type: Number,
    required: true
  }
})

const STORAGE_KEY = 'strava_yearly_goal_km'

const goalKm = ref(null)
const isEditing = ref(false)
const inputValue = ref('')
const inputRef = ref(null)

const hasGoal = computed(() => goalKm.value !== null && goalKm.value > 0)

const percentage = computed(() => {
  if (!hasGoal.value) return 0
  return Math.min(Math.round((props.yearlyDistance / goalKm.value) * 100), 999)
})

// Largeur réelle de la barre (plafonnée à 100% visuellement)
const progressWidth = computed(() => {
  if (!hasGoal.value) return 0
  return (props.yearlyDistance / goalKm.value) * 100
})

const isGoalReached = computed(() => hasGoal.value && props.yearlyDistance >= goalKm.value)

const remaining = computed(() => {
  if (!hasGoal.value) return 0
  return Math.max(0, goalKm.value - props.yearlyDistance).toFixed(0)
})

const progressLabel = computed(() => {
  if (!hasGoal.value) return ''
  return `${props.yearlyDistance.toFixed(0)} km / ${goalKm.value} km`
})

const startEditing = async () => {
  inputValue.value = goalKm.value ?? ''
  isEditing.value = true
  await nextTick()
  inputRef.value?.focus()
}

const confirmEdit = () => {
  const val = parseInt(inputValue.value, 10)
  if (!val || val <= 0) return
  goalKm.value = val
  localStorage.setItem(STORAGE_KEY, val)
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  inputValue.value = ''
}

const removeGoal = () => {
  goalKm.value = null
  localStorage.removeItem(STORAGE_KEY)
  isEditing.value = false
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) goalKm.value = parseInt(saved, 10)
})
</script>
