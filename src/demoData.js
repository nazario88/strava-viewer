// Jeu de données fictif pour le mode démonstration.
//
// Objectif : permettre de voir le dashboard sans se connecter à Strava, donc
// sans accorder le scope `activity:read_all` à l'aveugle.
//
// Le tirage est déterministe (PRNG à graine fixe) pour que la démo soit
// identique d'une visite à l'autre : les captures d'écran restent valables et
// deux visiteurs voient la même chose.

const SEED = 20260907

// mulberry32 : générateur pseudo-aléatoire compact et déterministe.
const createRandom = (seed) => {
  let a = seed
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Profil d'un pratiquant régulier plutôt que performant : un rythme
// hebdomadaire stable, quelques semaines creuses, une sortie longue le dimanche.
// `day` suit la convention lundi = 0.
const WEEKLY_PATTERN = [
  { day: 1, type: 'Run',  minKm: 6,   maxKm: 11,  chance: 0.85, paceMinPerKm: 5.6 },
  { day: 2, type: 'Walk', minKm: 3,   maxKm: 6,   chance: 0.25, paceMinPerKm: 12.0 },
  { day: 3, type: 'Run',  minKm: 5,   maxKm: 9,   chance: 0.75, paceMinPerKm: 5.4 },
  { day: 4, type: 'Ride', minKm: 20,  maxKm: 45,  chance: 0.20, paceMinPerKm: 2.2 },
  { day: 5, type: 'Swim', minKm: 1.2, maxKm: 2.2, chance: 0.55, paceMinPerKm: 24.0 },
  { day: 6, type: 'Run',  minKm: 10,  maxKm: 18,  chance: 0.90, paceMinPerKm: 5.9 }
]

const DAYS_OF_HISTORY = 400

// Légère saisonnalité : volume plus élevé au printemps, creux en décembre.
const seasonalFactor = (date) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000)
  return 0.85 + 0.3 * Math.sin(((dayOfYear - 60) / 365) * 2 * Math.PI)
}

export const generateDemoActivities = () => {
  const random = createRandom(SEED)
  const activities = []
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const start = new Date(today)
  start.setDate(start.getDate() - DAYS_OF_HISTORY)

  let id = 1

  for (let cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    const weekday = (cursor.getDay() + 6) % 7
    const slot = WEEKLY_PATTERN.find(p => p.day === weekday)
    if (!slot) continue

    const season = seasonalFactor(cursor)

    // Une semaine sur ~douze est sautée (blessure, vacances, vie).
    const isRestWeek = random() < 0.08
    if (isRestWeek) continue

    if (random() > slot.chance * season) continue

    const km = slot.minKm + random() * (slot.maxKm - slot.minKm)
    const distance = Math.round(km * season * 1000)

    // Heure de départ plausible : tôt en semaine, plus tard le week-end.
    const hour = weekday >= 5 ? 9 + Math.floor(random() * 3) : 6 + Math.floor(random() * 2)
    const startDate = new Date(cursor)
    startDate.setHours(hour, Math.floor(random() * 60), 0, 0)

    const movingTime = Math.round((distance / 1000) * slot.paceMinPerKm * 60)

    activities.push({
      id: id++,
      name: `Séance ${slot.type}`,
      start_date: startDate.toISOString(),
      start_date_local: startDate.toISOString(),
      distance,
      moving_time: movingTime,
      elapsed_time: movingTime,
      sport_type: slot.type,
      type: slot.type
    })
  }

  // Strava renvoie les activités de la plus récente à la plus ancienne.
  return activities.reverse()
}

export const DEMO_ATHLETE = {
  firstname: 'Athlète',
  lastname: 'démo',
  profile: 'avatar/athlete/large.png'
}
