<template>
  <div class="max-w-2xl mx-auto py-8">
    <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Configuration Strava API
        </h2>
        <p class="text-gray-600 dark:text-gray-200">
          Configurez vos identifiants Strava pour commencer l'analyse de vos données.
        </p>
      </div>

      <!-- Formulaire de configuration -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="clientId" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 transition-colors">
            Client ID Strava
          </label>
          <input 
            id="clientId"
            v-model="localConfig.clientId"
            type="text" 
            required
            placeholder="Ex: 123456"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-strava focus:border-strava transition-colors"
          />
        </div>

        <div>
          <label for="clientSecret" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 transition-colors">
            Client Secret Strava
          </label>
          <input 
            id="clientSecret"
            v-model="localConfig.clientSecret"
            type="password" 
            required
            placeholder="Ex: a1b2c3d4e5f6..."
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-strava focus:border-strava transition-colors"
          />
        </div>

        <button 
          type="submit" 
          class="w-full bg-strava hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Sauvegarder la configuration
        </button>
      </form>

      <!-- Instructions -->
      <InstructionsSection />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InstructionsSection from './InstructionsSection.vue'

const props = defineProps({
  stravaConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['saveConfiguration'])

// Copie locale pour éviter la mutation directe des props
const localConfig = ref({
  clientId: props.stravaConfig.clientId,
  clientSecret: props.stravaConfig.clientSecret
})

// Synchroniser avec les props si elles changent
watch(() => props.stravaConfig, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

const handleSubmit = () => {
  // Émettre les nouvelles valeurs plutôt que l'objet local
  props.stravaConfig.clientId = localConfig.value.clientId
  props.stravaConfig.clientSecret = localConfig.value.clientSecret
  emit('saveConfiguration')
}
</script>