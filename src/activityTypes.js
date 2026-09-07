// Référentiel partagé des types de sport Strava.
// Centralisé ici car la heatmap, le donut et le filtre par sport doivent
// impérativement utiliser les mêmes couleurs et libellés.

export const ACTIVITY_COLORS = {
  'Run':              '#FC4C02',
  'TrailRun':         '#E03D00',
  'VirtualRun':       '#FF6B35',
  'Ride':             '#22C55E',
  'VirtualRide':      '#16A34A',
  'MountainBikeRide': '#15803D',
  'GravelRide':       '#4ADE80',
  'Swim':             '#02B1FC',
  'OpenWaterSwim':    '#0284C7',
  'Walk':             '#A78BFA',
  'Hike':             '#7C3AED',
  'WeightTraining':   '#F59E0B',
  'Workout':          '#D97706',
  'Yoga':             '#FCD34D',
  'default':          '#9CA3AF'
}

export const ACTIVITY_LABELS = {
  'Run':              'Course',
  'TrailRun':         'Trail',
  'VirtualRun':       'Course virtuelle',
  'Ride':             'Vélo',
  'VirtualRide':      'Vélo virtuel',
  'MountainBikeRide': 'VTT',
  'GravelRide':       'Gravel',
  'Swim':             'Natation',
  'OpenWaterSwim':    'Nage en eau libre',
  'Walk':             'Marche',
  'Hike':             'Randonnée',
  'WeightTraining':   'Musculation',
  'Workout':          'Entraînement',
  'Yoga':             'Yoga'
}

// Sports dont la distance n'a pas de sens comparée aux autres :
// on ne mélange jamais leurs kilomètres dans un total commun.
export const DISTANCE_SPORTS = ['Run', 'TrailRun', 'VirtualRun', 'Ride', 'VirtualRide',
  'MountainBikeRide', 'GravelRide', 'Swim', 'OpenWaterSwim', 'Walk', 'Hike']

export const getActivityColor = (type) => ACTIVITY_COLORS[type] || ACTIVITY_COLORS['default']

export const getActivityLabel = (type) => ACTIVITY_LABELS[type] || type

// Convertit une couleur hex du référentiel en rgba, pour les remplissages de graphes.
export const hexToRgba = (hex, alpha) => {
  const value = hex.replace('#', '')
  const r = parseInt(value.substring(0, 2), 16)
  const g = parseInt(value.substring(2, 4), 16)
  const b = parseInt(value.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
