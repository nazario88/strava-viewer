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

        <!-- Sortie de secours pour qui ne veut pas accorder l'accès à l'aveugle -->
        <button
          @click="$emit('viewDemo')"
          class="w-full mt-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          Voir une démo sans se connecter
        </button>

        <p class="mt-4 text-xs text-gray-400 dark:text-gray-500 transition-colors">
          Aucune donnée n'est stockée sur nos serveurs.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FeatureItem from './FeatureItem.vue'
import StravaIcon from './icons/StravaIcon.vue'

defineEmits(['connectToStrava', 'viewDemo'])

const features = ref([
  { text: 'Distance totale par année' },
  { text: 'Évolution hebdomadaire' },
  { text: 'Répartition des activités' },
  { text: 'Tableau d\'intensité' }
])
</script>
