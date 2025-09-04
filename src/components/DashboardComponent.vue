<template>
  <div>
    <!-- Stats principales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard 
        title="Distance cette année"
        :value="`${yearlyDistance.toFixed(0)} km`"
        icon="trend"
        color="strava"
      />
      <StatCard 
        title="Activités ce mois"
        :value="monthlyActivities.toString()"
        icon="chart"
        color="strava"
      />
      <StatCard 
        title="Total activités"
        :value="totalActivities.toString()"
        icon="heart"
        color="strava"
      />
    </div>

    <!-- Graphiques -->
    <div class="space-y-8">
      <!-- Première ligne - graphiques existants -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Distance par semaine (12 dernières semaines)">
          <WeeklyChart :weekly-distances="weeklyDistances" />
        </ChartContainer>

        <ChartContainer title="Répartition des activités">
          <DistributionChart :activity-distribution="activityDistribution" />
        </ChartContainer>
      </div>

      <!-- Deuxième ligne - nouveaux graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Distance mensuelle (12 derniers mois)">
          <MonthlyChart :monthly-distances="monthlyDistances" />
        </ChartContainer>

        <ChartContainer title="Activité de l'année (heatmap)">
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
import WeeklyChart from './charts/WeeklyChart.vue'
import DistributionChart from './charts/DistributionChart.vue'
import MonthlyChart from './charts/MonthlyChart.vue'
import ActivityHeatmap from './charts/ActivityHeatmap.vue'

const props = defineProps({
  yearlyDistance: {
    type: Number,
    required: true
  },
  monthlyActivities: {
    type: Number,
    required: true
  },
  activityDistribution: {
    type: Object,
    required: true
  },
  weeklyDistances: {
    type: Object,
    required: true
  },
  monthlyDistances: {
    type: Object,
    required: true
  },
  yearlyActivities: {
    type: Array,
    required: true
  }
})

const totalActivities = computed(() => {
  return Object.values(props.activityDistribution).reduce((a, b) => a + b, 0)
})
</script>