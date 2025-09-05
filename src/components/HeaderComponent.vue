<template>
  <header class="border-b transition-colors" :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold transition-colors" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            Strava Analytics
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button 
            @click="$emit('toggleTheme')" 
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            title="Changer de thème"
          >
            <SunIcon v-if="isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>

          <!-- Authenticated User Menu -->
          <div v-if="isAuthenticated && athlete" class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <!-- Avatar avec image ou initiales -->
              <div class="relative">
                <img 
                  v-if="athlete.profile && athlete.profile !== '' && athlete.profile !== 'avatar/athlete/large.png'"
                  :src="athlete.profile" 
                  :alt="`${athlete.firstname} ${athlete.lastname}`" 
                  class="w-8 h-8 rounded-full object-cover"
                  @error="onImageError"
                >
                <div 
                  v-else
                  class="w-8 h-8 rounded-full bg-strava flex items-center justify-center text-white text-sm font-semibold"
                  :title="`${athlete.firstname} ${athlete.lastname}`"
                >
                  {{ getInitials(athlete.firstname, athlete.lastname) }}
                </div>
              </div>
              <span class="text-sm font-medium transition-colors" :class="isDarkMode ? 'text-gray-200' : 'text-gray-700'">
                {{ athlete.firstname }} {{ athlete.lastname }}
              </span>
            </div>
            <button 
              @click="$emit('disconnect')" 
              class="px-3 py-1.5 text-sm rounded-md border transition-colors duration-200 hover:shadow-sm"
              :class="isDarkMode 
                ? 'text-gray-300 border-gray-600 hover:text-white hover:bg-gray-700 hover:border-gray-500' 
                : 'text-gray-600 border-gray-300 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-400'"
            >
              Déconnexion
            </button>
          </div>
          
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import SunIcon from './icons/SunIcon.vue'
import MoonIcon from './icons/MoonIcon.vue'

defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  athlete: {
    type: Object,
    default: null
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['disconnect', 'toggleTheme'])

// Fonction pour obtenir les initiales
const getInitials = (firstname, lastname) => {
  const first = firstname ? firstname.charAt(0).toUpperCase() : ''
  const last = lastname ? lastname.charAt(0).toUpperCase() : ''
  return first + last || 'U' // 'U' pour User par défaut
}

// Gestion des erreurs d'image
const onImageError = (event) => {
  // Cacher l'image en cas d'erreur pour afficher les initiales
  event.target.style.display = 'none'
}
</script>