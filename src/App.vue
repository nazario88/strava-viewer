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
      <ErrorComponent
        v-if="error"
        :error="error"
        @retry="loadUserData"
        @disconnect="disconnect"
      />

      <!-- Loading Spinner -->
      <LoadingComponent v-else-if="isLoading" :message="loadingMessage" />

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

    <!-- Footer -->
    <FooterComponent />

    <!-- Bouton flottant partage -->
    <ShareButton
      :is-authenticated="isAuthenticated"
      :athlete-name="athlete ? `${athlete.firstname} ${athlete.lastname}` : ''"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import ErrorComponent from './components/ErrorComponent.vue'
import LoadingComponent from './components/LoadingComponent.vue'
import AuthorizationPage from './components/AuthorizationPage.vue'
import DashboardComponent from './components/DashboardComponent.vue'
import ShareButton from './components/ShareButton.vue'

// État de l'application
const isAuthenticated = ref(false)
const isLoading = ref(false)
const loadingMessage = ref('Chargement en cours...')
const accessToken = ref(null)
const refreshToken = ref(null)
const tokenExpiresAt = ref(null)
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

const redirectUri = 'https://strava.dailyheroes.io'
const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=read,activity:read_all`

// ─── Token management ─────────────────────────────────────────────────────────

const saveTokens = (data) => {
  accessToken.value = data.access_token
  refreshToken.value = data.refresh_token
  tokenExpiresAt.value = data.expires_at // timestamp UNIX en secondes

  localStorage.setItem('strava_access_token', data.access_token)
  localStorage.setItem('strava_refresh_token', data.refresh_token)
  localStorage.setItem('strava_token_expires_at', data.expires_at)
}

const loadTokensFromStorage = () => {
  accessToken.value = localStorage.getItem('strava_access_token')
  refreshToken.value = localStorage.getItem('strava_refresh_token')
  tokenExpiresAt.value = parseInt(localStorage.getItem('strava_token_expires_at') || '0', 10)
}

const isTokenExpired = () => {
  if (!tokenExpiresAt.value) return true
  // On anticipe de 5 minutes pour éviter les appels en limite
  const nowSeconds = Math.floor(Date.now() / 1000)
  return nowSeconds >= tokenExpiresAt.value - 300
}

const refreshAccessToken = async () => {
  if (!refreshToken.value) throw new Error('Pas de refresh token disponible')

  const response = await fetch('/api/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken.value
    })
  })

  const data = await response.json()
  if (!data.access_token) throw new Error('Échec du refresh token')

  saveTokens(data)
}

// Retourne un token valide, en rafraîchissant si nécessaire
const getValidToken = async () => {
  if (isTokenExpired()) {
    await refreshAccessToken()
  }
  return accessToken.value
}

// ─── Auth callback ─────────────────────────────────────────────────────────────

const checkAuthCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    await exchangeCodeForToken(code)
    window.history.replaceState({}, document.title, window.location.pathname)
  } else {
    loadTokensFromStorage()
    if (accessToken.value) {
      await loadUserData()
    }
  }
}

const exchangeCodeForToken = async (code) => {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch('/api/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, grant_type: 'authorization_code' })
    })

    const data = await response.json()
    if (!data.access_token) throw new Error('Échec de l\'authentification')

    saveTokens(data)
    await loadUserData()
  } catch (err) {
    error.value = 'Erreur lors de l\'authentification : ' + err.message
  } finally {
    isLoading.value = false
  }
}

// ─── Data loading ──────────────────────────────────────────────────────────────

const loadUserData = async () => {
  isLoading.value = true
  loadingMessage.value = 'Connexion à Strava...'

  try {
    const token = await getValidToken()

    // Infos de l'athlète
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!athleteResponse.ok) throw new Error('Token invalide')
    athlete.value = await athleteResponse.json()

    // Chargement paginé de toutes les activités
    activities.value = await fetchAllActivities(token)

    isAuthenticated.value = true
    calculateStatistics()
  } catch (err) {
    error.value = 'Erreur lors du chargement des données : ' + err.message
    //setTimeout(() => disconnect(), 3000)
  } finally {
    isLoading.value = false
    loadingMessage.value = 'Chargement en cours...'
  }
}

// Pagination : charge toutes les activités page par page
const fetchAllActivities = async (token) => {
  const allActivities = []
  let page = 1
  const perPage = 200

  while (true) {
    loadingMessage.value = `Chargement des activités... (${allActivities.length} récupérées)`

    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}&page=${page}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )

    if (!response.ok) throw new Error(`Erreur API Strava (page ${page})`)

    const pageData = await response.json()

    // Strava retourne un tableau vide quand il n'y a plus de données
    if (!Array.isArray(pageData) || pageData.length === 0) break

    allActivities.push(...pageData)

    // Si on reçoit moins que perPage, c'est la dernière page
    if (pageData.length < perPage) break

    page++
  }

  return allActivities
}

// ─── Statistics ────────────────────────────────────────────────────────────────

const calculateStatistics = () => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  yearlyDistance.value = activities.value
    .filter(a => new Date(a.start_date).getFullYear() === currentYear)
    .reduce((total, a) => total + a.distance, 0) / 1000

  monthlyActivities.value = activities.value
    .filter(a => {
      const d = new Date(a.start_date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    }).length

  calculateWeeklyDistances()
  calculateMonthlyDistances()
  calculateYearlyActivities()

  const distribution = {}
  activities.value.forEach(a => {
    const type = a.sport_type || a.type
    distribution[type] = (distribution[type] || 0) + 1
  })
  activityDistribution.value = distribution
}

const connectToStrava = () => {
  window.location.href = stravaAuthUrl
}

const disconnect = () => {
  localStorage.removeItem('strava_access_token')
  localStorage.removeItem('strava_refresh_token')
  localStorage.removeItem('strava_token_expires_at')
  accessToken.value = null
  refreshToken.value = null
  tokenExpiresAt.value = null
  isAuthenticated.value = false
  athlete.value = null
  activities.value = []
  yearlyDistance.value = 0
  monthlyActivities.value = 0
  weeklyDistances.value = []
  monthlyDistances.value = []
  yearlyActivities.value = []
  activityDistribution.value = {}
  error.value = null
}

// ─── Theme ─────────────────────────────────────────────────────────────────────

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
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

// ─── Chart calculations ────────────────────────────────────────────────────────

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
      .filter(a => {
        const d = new Date(a.start_date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .reduce((total, a) => total + a.distance, 0) / 1000

    months.push(monthNames[month])
    monthlyData.push(monthDistance.toFixed(1))
  }
  
  monthlyDistances.value = { labels: months, data: monthlyData }
}

const calculateWeeklyDistances = () => {
  const weeksLabels = []
  const weeklyData = []
  
  for (let i = 11; i >= 0; i--) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)

    const weekMonday = new Date(now)
    weekMonday.setDate(now.getDate() + diffToMonday - (i * 7))
    weekMonday.setHours(0, 0, 0, 0)

    const weekSunday = new Date(weekMonday)
    weekSunday.setDate(weekMonday.getDate() + 6)
    weekSunday.setHours(23, 59, 59, 999)

    const weekDistance = activities.value
      .filter(a => {
        const d = new Date(a.start_date)
        return d >= weekMonday && d <= weekSunday
      })
      .reduce((total, a) => total + a.distance, 0) / 1000

    weeksLabels.push(i === 0 ? 'Cette sem.' : `S-${i}`)
    weeklyData.push(weekDistance.toFixed(1))
  }
  
  weeklyDistances.value = { labels: weeksLabels, data: weeklyData }
}

const calculateYearlyActivities = () => {
  const currentYear = new Date().getFullYear()
  const yearActivities = []
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, month, day)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayActivities = activities.value.filter(a => {
        const activityDate = new Date(a.start_date).toISOString().split('T')[0]
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

// ─── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  loadThemePreference()
  checkAuthCallback()
})
</script>
