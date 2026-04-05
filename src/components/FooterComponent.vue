<template>
  <footer class="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- CTA Section -->
      <div class="py-12 text-center">
        <div class="max-w-3xl mx-auto">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Prêt à aller plus loin ?
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed transition-colors">
            Vos statistiques Strava révèlent votre potentiel sportif. 
            Et si vous transformiez cette motivation en <strong>habitudes durables</strong> dans tous les domaines de votre vie ?
          </p>
          <p class="text-gray-600 dark:text-gray-300 mb-8 transition-colors">
            Découvrez <strong>DailyHeroes</strong>, l'app qui vous aide à construire des routines saines : 
            sport, nutrition, sommeil, développement personnel...
          </p>
          
          <a 
            href="https://dailyheroes.io" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center bg-strava hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
            Découvrir DailyHeroes.io
          </a>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200 dark:border-gray-700"></div>

      <!-- Info Section -->
      <div class="py-8">
        <div class="grid md:grid-cols-3 gap-8 text-center md:text-left">
          
          <!-- Privacy -->
          <div class="flex flex-col items-center md:items-start">
            <div class="flex items-center mb-3">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <h4 class="font-semibold text-gray-900 dark:text-white transition-colors">Confidentialité</h4>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 transition-colors">
              Aucune donnée Strava n'est stockée sur nos serveurs.<br>
              Votre vie privée est notre priorité.
            </p>
          </div>

          <!-- Open Source -->
          <div class="flex flex-col items-center md:items-start">
            <div class="flex items-center mb-3">
              <svg class="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
              <h4 class="font-semibold text-gray-900 dark:text-white transition-colors">Open Source</h4>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 transition-colors mb-2">
              Code transparent et sécurisé.<br>
              Analysez vos données en toute confiance.
            </p>
            <a
              href="https://github.com/nazario88/strava-viewer"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <!-- GitHub icon -->
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Voir sur GitHub
            </a>
          </div>

          <!-- Contact -->
          <div class="flex flex-col items-center md:items-start">
            <div class="flex items-center mb-3">
              <svg class="w-5 h-5 text-strava mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              <h4 class="font-semibold text-gray-900 dark:text-white transition-colors">Contact</h4>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 transition-colors">
              <p class="mb-1">Questions ou suggestions ?</p>
              <p>hello [at] dailyheroes [dot] io</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-200 dark:border-gray-700 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
              Créé avec ❤️ par
              <a
                href="https://www.innospira.fr/"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-strava transition-colors"
              >
                Jérémie G.
              </a>
            </span>
          </div>
          
          <div class="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span>© {{ currentYear }}</span>
            <a 
              href="https://strava.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-strava transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.916"/>
              </svg>
              Powered by Strava
            </a>
          </div>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
