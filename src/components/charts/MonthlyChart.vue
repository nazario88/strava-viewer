<template>
  <div class="relative h-80">
    <canvas ref="chartCanvas" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  monthlyDistances: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = async () => {
  // Ajoutez cette vérification
  if (!chartCanvas.value || !props.monthlyDistances || !props.monthlyDistances.labels || props.monthlyDistances.labels.length === 0) {
    console.log('MonthlyChart: Pas de données disponibles')
    return
  }

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.monthlyDistances.labels,
      datasets: [{
        label: 'Distance (km)',
        data: props.monthlyDistances.data,
        backgroundColor: 'rgba(252, 76, 2, 0.8)',
        borderColor: '#FC4C02',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Distance: ${context.raw} km`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            font: {
              size: 12
            },
            callback: function(value) {
              return value + ' km'
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    }
  })
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

watch(() => props.monthlyDistances, () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  destroyChart()
})
</script>