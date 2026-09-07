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
        @view-demo="enterDemo"
      />

      <!-- Dashboard -->
      <div v-else>
        <DemoBanner v-if="isDemo" @connect-to-strava="connectToStrava" />

        <DashboardComponent
          :yearly-distance="yearlyDistance"
          :monthly-activities="monthlyActivities"
          :total-activities="totalActivities"
          :activity-distribution="activityDistribution"
          :weekly-distances="weeklyDistances"
          :monthly-distances="monthlyDistances"
          :yearly-activities="yearlyActivities"
          :regularity="regularity"
          :available-sports="availableSports"
          :selected-sport="selectedSport"
          @update:selected-sport="selectedSport = $event"
        />
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />

    <!-- Bouton flottant partage -->
    <ShareButton :is-authenticated="isAuthenticated" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
import ErrorComponent from './components/ErrorComponent.vue'
import LoadingComponent from './components/LoadingComponent.vue'
import AuthorizationPage from './components/AuthorizationPage.vue'
import DashboardComponent from './components/DashboardComponent.vue'
import ShareButton from './components/ShareButton.vue'
import DemoBanner from './components/DemoBanner.vue'
import { generateDemoActivities, DEMO_ATHLETE } from './demoData'

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
const isDemo = ref(false)
const selectedSport = ref('all')

// Configuration Strava
const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID

// Données pour les graphiques
const yearlyDistance = ref(0)
const monthlyActivities = ref(0)
const totalActivities = ref(0)
const weeklyDistances = ref([])
const monthlyDistances = ref({ labels: [], data: [] })
const yearlyActivities = ref([])  
const REGULARITY_INIT = () => ({ weeks: [], activeWeeks: 0, totalWeeks: 12, currentStreak: 0, bestStreak: 0, averageGapDays: null })
const activityDistribution = ref({})
const regularity = ref(REGULARITY_INIT())

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
  } else if (urlParams.has('demo')) {
    enterDemo()
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
    isDemo.value = false

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

// Activités du sport sélectionné. Toutes les statistiques de distance en
// dépendent : additionner des kilomètres de course et de natation n'a pas de
// sens. Seule la répartition (donut) reste calculée sur la totalité.
const filteredActivities = computed(() => {
  if (selectedSport.value === 'all') return activities.value
  return activities.value.filter(a => (a.sport_type || a.type) === selectedSport.value)
})

// Sports réellement pratiqués, du plus fréquent au moins fréquent.
const availableSports = computed(() => {
  const counts = {}
  activities.value.forEach(a => {
    const type = a.sport_type || a.type
    counts[type] = (counts[type] || 0) + 1
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type)
})

const calculateStatistics = () => {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const scoped = filteredActivities.value

  yearlyDistance.value = scoped
    .filter(a => new Date(a.start_date).getFullYear() === currentYear)
    .reduce((total, a) => total + a.distance, 0) / 1000

  monthlyActivities.value = scoped
    .filter(a => {
      const d = new Date(a.start_date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    }).length

  totalActivities.value = scoped.length

  calculateWeeklyDistances()
  calculateMonthlyDistances()
  calculateYearlyActivities()
  calculateRegularity()

  const distribution = {}
  activities.value.forEach(a => {
    const type = a.sport_type || a.type
    distribution[type] = (distribution[type] || 0) + 1
  })
  activityDistribution.value = distribution
}

// Changer de sport ne declenche aucun appel reseau : tout est recalcule en memoire.
watch(selectedSport, () => {
  if (isAuthenticated.value) calculateStatistics()
})

const enterDemo = () => {
  error.value = null
  isDemo.value = true
  athlete.value = DEMO_ATHLETE
  activities.value = generateDemoActivities()
  isAuthenticated.value = true
  calculateStatistics()
  // URL partageable et indexable, sans polluer l'historique de navigation.
  window.history.replaceState({}, document.title, '?demo=1')
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
  totalActivities.value = 0
  weeklyDistances.value = { labels: [], data: [] }
  monthlyDistances.value = { labels: [], data: [] }
  yearlyActivities.value = []
  activityDistribution.value = {}
  regularity.value = REGULARITY_INIT()
  error.value = null

  // Sortie du mode démo : on retire aussi le ?demo=1 de l'URL.
  if (isDemo.value) {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
  isDemo.value = false
  selectedSport.value = 'all'
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
    
    const monthDistance = filteredActivities.value
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

const WEEKS_WINDOW = 12

// Bornes lundi → dimanche de la semaine décalée de `weeksAgo` (0 = semaine en
// cours). Factorisé : le graphe hebdomadaire et la carte de régularité doivent
// découper les semaines exactement de la même façon.
const getWeekBounds = (weeksAgo) => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)

  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday - (weeksAgo * 7))
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return { monday, sunday }
}

const activitiesInWeek = (weeksAgo) => {
  const { monday, sunday } = getWeekBounds(weeksAgo)
  return filteredActivities.value.filter(a => {
    const d = new Date(a.start_date)
    return d >= monday && d <= sunday
  })
}

const calculateWeeklyDistances = () => {
  const weeksLabels = []
  const weeklyData = []

  for (let i = WEEKS_WINDOW - 1; i >= 0; i--) {
    const weekDistance = activitiesInWeek(i)
      .reduce((total, a) => total + a.distance, 0) / 1000

    weeksLabels.push(i === 0 ? 'Cette sem.' : `S-${i}`)
    weeklyData.push(weekDistance.toFixed(1))
  }

  weeklyDistances.value = { labels: weeksLabels, data: weeklyData }
}

// Mesure l'assiduité plutôt que le volume : c'est l'angle du produit.
const calculateRegularity = () => {
  // Nombre de séances par semaine, de la plus ancienne à la semaine en cours.
  const weeks = []
  for (let i = WEEKS_WINDOW - 1; i >= 0; i--) {
    weeks.push(activitiesInWeek(i).length)
  }

  const activeWeeks = weeks.filter(count => count > 0).length

  // Série en cours. La semaine courante n'est pas terminée : si elle est encore
  // vide un lundi matin, on ne casse pas la série pour autant.
  let currentStreak = 0
  const lastIndex = weeks.length - 1
  let cursor = weeks[lastIndex] > 0 ? lastIndex : lastIndex - 1
  while (cursor >= 0 && weeks[cursor] > 0) {
    currentStreak++
    cursor--
  }

  let bestStreak = 0
  let run = 0
  for (const count of weeks) {
    run = count > 0 ? run + 1 : 0
    if (run > bestStreak) bestStreak = run
  }

  // Écart moyen entre deux séances consécutives sur la fenêtre.
  const { monday: windowStart } = getWeekBounds(WEEKS_WINDOW - 1)
  const dates = filteredActivities.value
    .map(a => new Date(a.start_date))
    .filter(d => d >= windowStart)
    .sort((a, b) => a - b)

  let averageGapDays = null
  if (dates.length > 1) {
    let totalDays = 0
    for (let i = 1; i < dates.length; i++) {
      totalDays += (dates[i] - dates[i - 1]) / 86400000
    }
    averageGapDays = totalDays / (dates.length - 1)
  }

  regularity.value = { weeks, activeWeeks, totalWeeks: WEEKS_WINDOW, currentStreak, bestStreak, averageGapDays }
}

const calculateYearlyActivities = () => {
  const today = new Date()
  const yearActivities = []

  // Couvre les 6 derniers mois glissants (aligné avec la heatmap)
  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  for (let ref = new Date(start); ref <= today; ref.setMonth(ref.getMonth() + 1)) {
    const year = ref.getFullYear()
    const month = ref.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (date > today) break
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const dayActivities = filteredActivities.value.filter(a => {
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
