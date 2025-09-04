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
              <img 
                :src="athlete.profile" 
                :alt="`${athlete.firstname} ${athlete.lastname}`" 
                class="w-8 h-8 rounded-full"
              >
              <span class="text-sm font-medium transition-colors" :class="isDarkMode ? 'text-gray-200' : 'text-gray-700'">
                {{ athlete.firstname }} {{ athlete.lastname }}
              </span>
            </div>
            <button 
              @click="$emit('disconnect')" 
              class="text-sm transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'"
            >
              Déconnexion
            </button>
          </div>
          
          <!-- Configuration Menu -->
          <div v-else-if="isConfigured" class="flex items-center">
            <button 
              @click="$emit('resetConfiguration')" 
              class="text-sm transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'"
            >
              Modifier la configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import SunIcon from './icons/SunIcon.vue'
import MoonIcon from './icons/MoonIcon.vue'

defineProps({
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  isConfigured: {
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

defineEmits(['disconnect', 'resetConfiguration', 'toggleTheme'])
</script>