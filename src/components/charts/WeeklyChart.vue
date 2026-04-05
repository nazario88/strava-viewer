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
  weeklyDistances: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const generateWeekLabels = () => {
  const labels = []
  for (let i = 11; i >= 0; i--) {
    if (i === 0) {
      labels.push('Cette sem.')
    } else {
      labels.push(`S-${i}`)
    }
  }
  return labels
}

const createChart = async () => {
  if (!chartCanvas.value || !props.weeklyDistances?.data) return

  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  const labels = generateWeekLabels()

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Distance (km)',
        data: props.weeklyDistances.data,
        borderColor: '#FC4C02',
        backgroundColor: 'rgba(252, 76, 2, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#FC4C02',
        pointBorderColor: '#FC4C02',
        pointHoverBackgroundColor: '#FC4C02',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Distance : ${context.raw} km`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.07)' },
          ticks: {
            font: { size: 11 },
            callback: (value) => `${value} km`
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
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

watch(() => props.weeklyDistances, () => { createChart() }, { deep: true })

onMounted(() => { createChart() })
onUnmounted(() => { destroyChart() })
</script>
