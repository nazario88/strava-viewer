<template>
  <div class="text-center py-16">
    <div class="max-w-md mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors">
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Connectez-vous à Strava
          </h2>
          <p class="text-gray-600 dark:text-gray-300 transition-colors">
            Analysez vos performances et suivez vos progrès avec des graphiques détaillés.
          </p>
        </div>

        <div class="space-y-4 mb-6">
          <FeatureItem 
            v-for="feature in features"
            :key="feature.text"
            :text="feature.text"
          />
        </div>

        <button 
          @click="$emit('connectToStrava')" 
          class="w-full bg-strava hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <StravaIcon class="w-5 h-5 mr-2" />
          Se connecter avec Strava
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FeatureItem from './FeatureItem.vue'
import StravaIcon from './icons/StravaIcon.vue'

defineEmits(['connectToStrava'])

const features = ref([
  { text: 'Distance totale par année' },
  { text: 'Évolution hebdomadaire' },
  { text: 'Répartition des activités' },
  { text: 'Tableau d\'intensité' }
])
</script>