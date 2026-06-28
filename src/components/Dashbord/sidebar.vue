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
defineProps({
  region: String,
  weather: Object,
  risk: String
})
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

        <strong>{{ weather?.humidity }}%</strong>

      </article>

      <article>

        <span>Vent</span>

        <strong>

          {{ weather?.windSpeed }}

          km/h

          {{ weather?.windDirection }}

        </strong>

      </article>

      <article>

        <span>Pression</span>

        <strong>

          {{ weather?.pressure }}

          hPa

        </strong>

      </article>

      <article>

        <span>Visibilité</span>

        <strong>

          {{ weather?.visibility }}

        </strong>

      </article>

      <article>

        <span>Risque</span>

        <strong>{{ risk }}</strong>

    </article>

    </div>

    <div class="weather-card__note">

      <span>Mise à jour</span>

      <p>

        {{ weather?.updatedAt }}

      </p>

    </div>

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

.weather-card__note p {
  margin: 0;
  color: #4f6756;
  line-height: 1.5;
}
</style>
