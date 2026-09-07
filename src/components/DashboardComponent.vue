<template>
  <div>
    <!-- Filtre par sport : les distances de course et de natation ne s'additionnent pas -->
    <SportFilter
      :sports="availableSports"
      :model-value="selectedSport"
      @update:model-value="$emit('update:selectedSport', $event)"
    />

    <!-- Stats principales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard 
        :title="`Distance cette année${sportSuffix}`"
        :value="`${yearlyDistance.toFixed(0)} km`"
        icon="trend"
        color="strava"
      />
      <StatCard 
        :title="`Activités ce mois${sportSuffix}`"
        :value="monthlyActivities.toString()"
        icon="chart"
        color="strava"
      />
      <StatCard 
        :title="`Total activités${sportSuffix}`"
        :value="totalActivities.toString()"
        icon="heart"
        color="strava"
      />
    </div>

    <!-- Objectif annuel -->
    <YearlyGoal :yearly-distance="yearlyDistance" />

    <!-- Graphiques -->
    <div class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer :title="`Distance par semaine (12 dernières semaines)${sportSuffix}`">
          <WeeklyChart :weekly-distances="weeklyDistances" :color="sportColor" />
        </ChartContainer>

        <!-- Sans filtre, la répartition situe les sports les uns par rapport aux
             autres. Filtrée elle vaudrait 100 %, donc on montre plutôt
             l'assiduité sur le sport choisi. -->
        <ChartContainer v-if="showDistribution" title="Répartition des activités">
          <DistributionChart :activity-distribution="activityDistribution" />
        </ChartContainer>

        <ChartContainer v-else :title="`Régularité${sportSuffix}`">
          <RegularityCard :regularity="regularity" :color="sportColor" />
        </ChartContainer>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer :title="`Distance mensuelle (12 derniers mois)${sportSuffix}`">
          <MonthlyChart :monthly-distances="monthlyDistances" :color="sportColor" />
        </ChartContainer>

        <ChartContainer title="Activité des 6 derniers mois">
          <ActivityHeatmap :yearly-activities="yearlyActivities" />
        </ChartContainer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatCard from './dashboard/StatCard.vue'
import ChartContainer from './dashboard/ChartContainer.vue'
import SportFilter from './dashboard/SportFilter.vue'
import RegularityCard from './dashboard/RegularityCard.vue'
import WeeklyChart from './charts/WeeklyChart.vue'
import DistributionChart from './charts/DistributionChart.vue'
import MonthlyChart from './charts/MonthlyChart.vue'
import ActivityHeatmap from './charts/ActivityHeatmap.vue'
import YearlyGoal from './YearlyGoal.vue'
import { getActivityLabel, getActivityColor } from '../activityTypes'

const props = defineProps({
  yearlyDistance: { type: Number, required: true },
  monthlyActivities: { type: Number, required: true },
  totalActivities: { type: Number, required: true },
  activityDistribution: { type: Object, required: true },
  weeklyDistances: { type: Object, required: true },
  monthlyDistances: { type: Object, required: true },
  yearlyActivities: { type: Array, required: true },
  regularity: { type: Object, required: true },
  availableSports: { type: Array, default: () => [] },
  selectedSport: { type: String, default: 'all' }
})

defineEmits(['update:selectedSport'])

const showDistribution = computed(() => props.selectedSport === 'all')

// Rappelle le sport actif dans chaque titre, sinon les chiffres filtrés induisent en erreur.
const sportSuffix = computed(() =>
  props.selectedSport === 'all' ? '' : ` — ${getActivityLabel(props.selectedSport)}`
)

// Les graphes de distance reprennent la couleur du sport filtré.
const sportColor = computed(() =>
  props.selectedSport === 'all' ? '#FC4C02' : getActivityColor(props.selectedSport)
)
</script>
