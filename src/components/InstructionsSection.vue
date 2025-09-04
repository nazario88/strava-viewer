<template>
  <div class="mt-8 p-6 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">
      📋 Comment obtenir vos identifiants Strava ?
    </h3>
    
    <div class="space-y-4 text-sm text-gray-700">
      <div class="flex items-start">
        <span class="inline-flex items-center justify-center w-6 h-6 bg-strava text-white text-xs font-semibold rounded-full mr-3 mt-0.5">
          1
        </span>
        <div>
          <p class="font-medium">Créer une application Strava</p>
          <p>
            Rendez-vous sur 
            <a 
              href="https://www.strava.com/settings/api" 
              target="_blank" 
              class="text-strava hover:underline"
            >
              https://www.strava.com/settings/api
            </a> 
            et connectez-vous à votre compte.
          </p>
        </div>
      </div>

      <div class="flex items-start">
        <span class="inline-flex items-center justify-center w-6 h-6 bg-strava text-white text-xs font-semibold rounded-full mr-3 mt-0.5">
          2
        </span>
        <div>
          <p class="font-medium">Créer votre App</p>
          <p>Cliquez sur "Create & Manage Your App" puis remplissez :</p>
          <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
            <li><strong>Application Name:</strong> Un nom pour votre app (ex: "Mon Dashboard")</li>
            <li><strong>Category:</strong> Choisissez "Data Importer"</li>
            <li><strong>Website:</strong> {{ currentOrigin }}</li>
            <li><strong>Authorization Callback Domain:</strong> {{ currentHostname }}</li>
          </ul>
        </div>
      </div>

      <div class="flex items-start">
        <span class="inline-flex items-center justify-center w-6 h-6 bg-strava text-white text-xs font-semibold rounded-full mr-3 mt-0.5">
          3
        </span>
        <div>
          <p class="font-medium">Récupérer les identifiants</p>
          <p>Une fois votre app créée, vous trouverez :</p>
          <ul class="list-disc list-inside ml-4 mt-2 space-y-1">
            <li><strong>Client ID:</strong> Numéro affiché sur la page</li>
            <li><strong>Client Secret:</strong> Cliquez sur "Show" pour l'afficher</li>
          </ul>
        </div>
      </div>

      <div class="flex items-start">
        <span class="inline-flex items-center justify-center w-6 h-6 bg-strava text-white text-xs font-semibold rounded-full mr-3 mt-0.5">
          4
        </span>
        <div>
          <p class="font-medium">Saisir les données</p>
          <p>Copiez-collez le Client ID et le Client Secret dans le formulaire ci-dessus.</p>
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div class="text-sm">
          <p class="font-medium text-blue-800 dark:text-blue-200 transition-colors">Note de sécurité</p>
          <p class="text-blue-700 dark:text-blue-300 mt-1 transition-colors">
            Ces informations sont stockées localement dans votre navigateur et ne sont jamais envoyées à des serveurs tiers.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const currentOrigin = computed(() => window.location.origin)
const currentHostname = computed(() => window.location.hostname)
</script>