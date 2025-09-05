<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-orange-100 dark:from-gray-900 dark:to-gray-950">
    <!-- Header -->
    <HeaderComponent 
      :is-authenticated="isAuthenticated"
      :athlete="athlete"
      :is-dark-mode="isDarkMode"
      @disconnect="disconnect"
      @toggle-theme="toggleTheme"
    />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Display -->
      <ErrorComponent v-if="error" :error="error" />

      <!-- Loading Spinner -->
      <LoadingComponent v-else-if="isLoading" />

      <!-- Authorization Page -->
      <AuthorizationPage 
        v-else-if="!isAuthenticated"
        @connect-to-strava="connectToStrava"
      />

      <!-- Dashboard -->
      <DashboardComponent 
        v-else
        :yearly-distance="yearlyDistance"
        :monthly-activities="monthlyActivities"
        :activity-distribution="activityDistribution"
        :weekly-distances="weeklyDistances"
        :monthly-distances="monthlyDistances" 
        :yearly-activities="yearlyActivities"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import HeaderComponent from './components/HeaderComponent.vue'
import ErrorComponent from './components/ErrorComponent.vue'
import LoadingComponent from './components/LoadingComponent.vue'
import AuthorizationPage from './components/AuthorizationPage.vue'
import DashboardComponent from './components/DashboardComponent.vue'

// État de l'application
const isAuthenticated = ref(false)
const isLoading = ref(false)
const accessToken = ref(null)
const athlete = ref(null)
const activities = ref([])
const error = ref(null)
const isDarkMode = ref(false)

// Configuration Strava
const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID

// Données pour les graphiques
const yearlyDistance = ref(0)
const monthlyActivities = ref(0)
const weeklyDistances = ref([])
const monthlyDistances = ref({ labels: [], data: [] })
const yearlyActivities = ref([])  
const activityDistribution = ref({})

// URLs dynamiques
//const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=read,activity:read_all`
const redirectUri = 'https://strava.dailyheroes.io'
const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=read,activity:read_all`

// Vérifier si on revient de l'auth Strava
const checkAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    await exchangeCodeForToken(code)
    window.history.replaceState({}, document.title, window.location.pathname)
  } else {
    const savedToken = localStorage.getItem('strava_access_token')
    if (savedToken) {
      accessToken.value = savedToken
      await loadUserData()
    }
  }
}

// Échanger le code contre un access token
const exchangeCodeForToken = async (code) => {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch('/api/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code
      })
    })

    const data = await response.json()
    
    if (data.access_token) {
      accessToken.value = data.access_token
      localStorage.setItem('strava_access_token', data.access_token)
      await loadUserData()
    } else {
      throw new Error('Échec de l\'authentification')
    }
  } catch (err) {
    error.value = 'Erreur lors de l\'authentification: ' + err.message
  } finally {
    isLoading.value = false
  }
}

// Charger les données utilisateur
const loadUserData = async () => {
  isLoading.value = true
  
  try {
    // Récupérer les infos de l'athlète
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`
      }
    })
    athlete.value = await athleteResponse.json()

    // Récupérer les activités (limitées aux 200 dernières)
    const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=200', {
      headers: {
        'Authorization': `Bearer ${accessToken.value}`
      }
    })
    activities.value = await activitiesResponse.json()

    isAuthenticated.value = true
    calculateStatistics()
  } catch (err) {
    error.value = 'Erreur lors du chargement des données: ' + err.message
  } finally {
    isLoading.value = false
  }
}

// Calculer les statistiques
const calculateStatistics = () => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  // Distance totale sur l'année
  yearlyDistance.value = activities.value
    .filter(activity => new Date(activity.start_date).getFullYear() === currentYear)
    .reduce((total, activity) => total + activity.distance, 0) / 1000 // Conversion en km

  // Nombre d'activités ce mois
  monthlyActivities.value = activities.value
    .filter(activity => {
      const activityDate = new Date(activity.start_date)
      return activityDate.getFullYear() === currentYear && 
             activityDate.getMonth() === currentMonth
    }).length

  // Calculer toutes les métriques
  calculateWeeklyDistances()
  calculateMonthlyDistances()
  calculateYearlyActivities()

  // Répartition des activités
  const distribution = {}
  activities.value.forEach(activity => {
    const type = activity.sport_type || activity.type
    distribution[type] = (distribution[type] || 0) + 1
  })
  activityDistribution.value = distribution
}

// Se connecter à Strava
const connectToStrava = () => {
  //window.location.href = stravaAuthUrl.value
  window.location.href = stravaAuthUrl
}

// Se déconnecter
const disconnect = () => {
  localStorage.removeItem('strava_access_token')
  accessToken.value = null
  isAuthenticated.value = false
  athlete.value = null
  activities.value = []
  yearlyDistance.value = 0
  monthlyActivities.value = 0
  weeklyDistances.value = []
  monthlyDistances.value = []
  yearlyActivities.value = []
  activityDistribution.value = {}
}

// Gestion du thème
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme_preference', isDarkMode.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const loadThemePreference = () => {
  const saved = localStorage.getItem('theme_preference')
  if (saved) {
    isDarkMode.value = saved === 'dark'
  } else {
    // Détecter la préférence système
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const calculateMonthlyDistances = () => {
  const months = []
  const monthlyData = []
  const monthNames = ['Jan.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const monthDistance = activities.value
      .filter(activity => {
        const activityDate = new Date(activity.start_date)
        return activityDate.getFullYear() === year && activityDate.getMonth() === month
      })
      .reduce((total, activity) => total + activity.distance, 0) / 1000

    months.push(monthNames[month])
    monthlyData.push(monthDistance.toFixed(1))
  }
  
  monthlyDistances.value = { labels: months, data: monthlyData }
}

const calculateWeeklyDistances = () => {
  const weeks = []
  const weeklyData = []
  
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (i * 7))
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekDistance = activities.value
      .filter(activity => {
        const activityDate = new Date(activity.start_date)
        return activityDate >= weekStart && activityDate <= weekEnd
      })
      .reduce((total, activity) => total + activity.distance, 0) / 1000

    weeks.push(`Sem ${52 - i}`)
    weeklyData.push(weekDistance.toFixed(1))
  }
  
  weeklyDistances.value = { labels: weeks, data: weeklyData }
}

const calculateYearlyActivities = () => {
  const currentYear = new Date().getFullYear()
  const yearActivities = []
  
  // Générer tous les jours de l'année
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, month, day)
      const dateStr = date.toISOString().split('T')[0]
      
      // Trouver les activités pour cette date
      const dayActivities = activities.value.filter(activity => {
        const activityDate = new Date(activity.start_date).toISOString().split('T')[0]
        return activityDate === dateStr
      })
      
      yearActivities.push({
        date: dateStr,
        count: dayActivities.length,
        activities: dayActivities.map(a => ({
          type: a.sport_type || a.type,
          distance: (a.distance / 1000).toFixed(1)
        }))
      })
    }
  }
  
  yearlyActivities.value = yearActivities
}

// Initialisation
onMounted(() => {
  loadThemePreference()
  checkAuthCallback()
})
</script>