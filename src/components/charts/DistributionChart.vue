<template>
  <div class="relative h-80">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { getActivityColor, getActivityLabel } from '../../activityTypes'

Chart.register(...registerables)

const props = defineProps({
  activityDistribution: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null


// Lire la couleur du texte selon le thème courant
const getLegendTextColor = () => {
  return document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#6B7280'
}

const createChart = async () => {
  if (!chartCanvas.value || Object.keys(props.activityDistribution).length === 0) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  const labels = Object.keys(props.activityDistribution)
  const data = Object.values(props.activityDistribution)
  const backgroundColors = labels.map(label => getActivityColor(label))
  const legendColor = getLegendTextColor()

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            font: { size: 12 },
            color: legendColor,
            generateLabels: (chart) => {
              const { labels: chartLabels, datasets } = chart.data
              if (!chartLabels?.length || !datasets?.length) return []

              const total = datasets[0].data.reduce((a, b) => a + b, 0)

              return chartLabels.map((label, i) => {
                const value = datasets[0].data[i]
                const percentage = ((value / total) * 100).toFixed(1)
                return {
                  text: `${getActivityLabel(label)} (${percentage}%)`,
                  fillStyle: datasets[0].backgroundColor[i],
                  strokeStyle: document.documentElement.classList.contains('dark') ? '#1F2937' : '#ffffff',
                  lineWidth: 2,
                  fontColor: legendColor,
                  color: legendColor,
                  hidden: false,
                  index: i
                }
              })
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.raw / total) * 100).toFixed(1)
              return `${getActivityLabel(context.label)} : ${context.raw} activités (${percentage}%)`
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

watch(() => props.activityDistribution, () => { createChart() }, { deep: true })

// Observer les changements de thème pour recréer le graphique avec les bonnes couleurs
const themeObserver = new MutationObserver(() => { createChart() })

onMounted(() => {
  createChart()
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  destroyChart()
  themeObserver.disconnect()
})
</script>
