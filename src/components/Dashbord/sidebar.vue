<!-- <script setup>
defineProps({
  region: {
    type: String,
    default: '',
  },
  weather: {
    type: Object,
    default: null,
  },
})
</script> -->

<script setup>
import { Chart } from 'chart.js/auto'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  region: String,
  weather: Object,
  forecast: {
    type: Array,
    default: () => [],
  },
  risk: Object
})

const riskGaugeStyle = computed(() => ({
  '--risk-color': props.risk?.color || '#6b7280',
  '--risk-score': `${props.risk?.score ?? 0}%`,
}))

const chartCanvas = ref(null)
let chart = null

const forecastPoints = computed(() =>
  props.forecast.filter((day) => day.riskScore !== null)
)

watch(
  forecastPoints,
  async () => {
    await nextTick()
    renderRiskChart()
  },
  { deep: true, immediate: true }
)

onBeforeUnmount(() => {
  destroyChart()
})

function renderRiskChart() {
  if (!chartCanvas.value || !forecastPoints.value.length) {
    destroyChart()
    return
  }

  const labels = forecastPoints.value.map((day) => day.label)
  const values = forecastPoints.value.map((day) => day.riskScore)

  destroyChart()

  chart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Risque',
          data: values,
          borderColor: props.risk?.color || '#2f9e44',
          backgroundColor: 'rgba(47, 158, 68, 0.12)',
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: props.risk?.color || '#2f9e44',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `Risque: ${context.parsed.y}/100`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#607468',
          },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            color: '#607468',
          },
          grid: {
            color: '#edf3ef',
          },
        },
      },
    },
  })
}

function destroyChart() {
  if (chart) {
    chart.destroy()
    chart = null
  }
}
</script>

<template>
  <div class="weather-card">

    <div class="weather-card__hero">

      <span class="weather-card__tag">
        {{ weather?.source }}
      </span>

      <h3>{{ region }}</h3>

      <p>
        {{ weather?.conditionFr }}
      </p>

    </div>

    <div class="weather-card__temperature">

      <div>

        <span>Température</span>

        <strong>

          {{ weather?.temp ?? "--" }}

          <small>°C</small>

        </strong>

        <p>Ressenti {{ weather?.feelsLike ?? "--" }}°C</p>

      </div>

      <img
        v-if="weather"
        :src="weather.iconUrl"
        :alt="weather.conditionFr"
      >

    </div>

    <div class="weather-card__grid">

      <article>

        <span>Humidité</span>

        <strong>{{ weather?.humidity ?? "--" }}%</strong>

      </article>

      <article>

        <span>Vent</span>

        <strong>

          {{ weather?.windSpeed ?? "--" }}

          km/h

          {{ weather?.windDirection }}

        </strong>

      </article>

      <article>

        <span>Pression</span>

        <strong>

          {{ weather?.pressure ?? "--" }}

          hPa

        </strong>

      </article>

      <article>

        <span>Visibilité</span>

        <strong>

          {{ weather?.visibility ?? "--" }}

        </strong>

      </article>

    </div>

    <section class="weather-card__risk" :class="risk ? `weather-card__risk--${risk.tone}` : ''">
      <div class="weather-card__risk-header">
        <div>
          <span>Risque agricole</span>
          <strong>{{ risk?.label || "Indisponible" }}</strong>
        </div>
        <p>{{ risk?.score ?? "--" }}<small>/100</small></p>
      </div>

      <div class="risk-gauge" :style="riskGaugeStyle" aria-hidden="true">
        <span></span>
      </div>

      <div class="risk-line-chart">
        <canvas
          v-if="forecastPoints.length"
          ref="chartCanvas"
          aria-label="Evolution du risque agricole sur 5 jours"
          role="img"
        ></canvas>
        <p v-else>Aucune prévision disponible pour tracer la courbe.</p>
      </div>

      <p class="weather-card__risk-summary">
        {{ risk?.summary || "Les donnees meteo ne suffisent pas encore pour calculer le risque." }}
      </p>
    </section>

    <!-- <div class="weather-card__note">

      <span>Mise à jour</span>

      <p>

        {{ weather?.updatedAt }}

      </p>

    </div> -->

  </div>
</template>

<style scoped>
.weather-card {
  display: grid;
  gap: 18px;
}

.weather-card__hero {
  padding: 18px;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(49, 111, 81, 0.92), rgba(45, 91, 132, 0.9)),
    #316f51;
  color: #ffffff;
}

.weather-card__tag {
  display: inline-flex;
  margin-bottom: 12px;
  padding: 6px 9px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.weather-card__hero h3 {
  margin: 0 0 8px;
  font-size: 1.6rem;
}

.weather-card__hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.5;
}

.weather-card__temperature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border: 1px solid #dce9e0;
  border-radius: 8px;
  background: #fbfdfb;
}

.weather-card__temperature span,
.weather-card__grid span,
.weather-card__note span {
  display: block;
  margin-bottom: 7px;
  color: #5d7864;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.weather-card__temperature strong {
  color: #1e3928;
  font-size: 2.35rem;
  line-height: 1;
}

.weather-card__temperature small {
  margin-left: 4px;
  font-size: 0.92rem;
}

.weather-card__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #fff1bd;
  color: #7a5b00;
  font-size: 1.55rem;
}

.weather-card__icon::before {
  content: '';
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #d99f18;
  box-shadow: 0 0 0 8px rgba(217, 159, 24, 0.18);
}

.weather-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.weather-card__grid article,
.weather-card__note {
  padding: 14px;
  border: 1px solid #dfeae3;
  border-radius: 8px;
  background: #ffffff;
}

.weather-card__grid strong {
  color: #213d2a;
  font-size: 1rem;
}

.weather-card__risk {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid #dfeae3;
  border-radius: 8px;
  background: #ffffff;
}

.weather-card__risk-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.weather-card__risk-header span {
  display: block;
  margin-bottom: 7px;
  color: #5d7864;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.weather-card__risk-header strong {
  color: #213d2a;
  font-size: 1.25rem;
}

.weather-card__risk-header p {
  margin: 0;
  color: var(--risk-color, #4b5563);
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}

.weather-card__risk-header small {
  color: #6b7d70;
  font-size: 0.82rem;
}

.risk-gauge {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8f0eb;
}

.risk-gauge span {
  display: block;
  width: var(--risk-score, 0%);
  height: 100%;
  border-radius: inherit;
  background: var(--risk-color, #6b7280);
  transition: width 0.25s ease;
}

.weather-card__risk-summary {
  margin: 0;
  color: #4f6756;
  line-height: 1.5;
}

.risk-line-chart {
  position: relative;
  height: 210px;
  min-height: 210px;
}

.risk-line-chart canvas {
  width: 100%;
  height: 100%;
}

.risk-line-chart p {
  margin: 0;
  color: #607468;
  line-height: 1.5;
}

.weather-card__note p {
  margin: 0;
  color: #4f6756;
  line-height: 1.5;
}

@media (max-width: 380px) {
  .risk-line-chart {
    height: 180px;
    min-height: 180px;
  }
}
</style>
