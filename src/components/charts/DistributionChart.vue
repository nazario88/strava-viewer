<template>
  <div class="relative h-80">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

// Enregistrer tous les composants Chart.js
Chart.register(...registerables)

const props = defineProps({
  activityDistribution: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

// Palette de couleurs pour les différentes activités
const colors = [
  '#FC4C02', // Strava Orange
  '#FF6B35', // Orange clair
  '#F7931E', // Orange-jaune
  '#FFD23F', // Jaune
  '#06D6A0', // Turquoise
  '#118AB2', // Bleu
  '#073B4C', // Bleu foncé
  '#9D4EDD', // Violet
  '#F72585', // Rose
  '#4CC9F0'  // Bleu ciel
]

const createChart = async () => {
  if (!chartCanvas.value || Object.keys(props.activityDistribution).length === 0) return

  // Détruire le graphique existant si il existe
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  
  const labels = Object.keys(props.activityDistribution)
  const data = Object.values(props.activityDistribution)
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data
              if (data.labels.length && data.datasets.length) {
                return data.labels.map(function(label, i) {
                  const dataset = data.datasets[0]
                  const value = dataset.data[i]
                  const percentage = ((value / data.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
                  
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor,
                    lineWidth: dataset.borderWidth,
                    fontColor: '#6B7280',
                    hidden: false,
                    index: i
                  }
                })
              }
              return []
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.raw
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} activités (${percentage}%)`
            }
          }
        }
      },
      cutout: '60%'
    }
  })
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

// Watcher pour recréer le graphique quand les données changent
watch(() => props.activityDistribution, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  destroyChart()
})
</script>