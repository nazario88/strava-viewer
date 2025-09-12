<template>
  <header class="border-b transition-colors" :class="isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center min-w-0 flex-1">
          <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <h1 class="text-lg sm:text-2xl font-bold transition-colors" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Strava Analytics
            </h1>
            <a 
              href="https://dailyheroes.io" 
              target="_blank" 
              class="hidden sm:flex text-xs sm:text-sm font-medium opacity-60 hover:opacity-90 transition-all duration-200 hover:scale-105 items-center gap-1"
              :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
            >
              by DailyHeroes.io
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>
        
        <div class="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">

          <!-- Authenticated User Menu -->
          <div v-if="isAuthenticated && athlete" class="flex items-center space-x-1 sm:space-x-4">
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
              <span class="hidden sm:inline text-sm font-medium transition-colors" :class="isDarkMode ? 'text-gray-200' : 'text-gray-700'">
                {{ athlete.firstname }} {{ athlete.lastname }}
              </span>
            </div>
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

            <!-- Logout -->
            <button 
              @click="$emit('disconnect')" 
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
              title="Se déconnecter"
            >
              <span class="hidden sm:inline">Déconnexion</span>
              <svg class="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 2v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <path d="M5.08 7.08a9 9 0 1 0 13.84 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </button>
          </div>
          
          <!-- No auth - Just Theme Toggle -->
          <button 
            @click="$emit('toggleTheme')" 
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            title="Changer de thème"
          >
            <SunIcon v-if="isDarkMode" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>
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