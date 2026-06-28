import { reactive } from 'vue'
import { getRegionById } from '@/data/regions'
// import { calculateRiskLLM } from '@/services/riskLlm.js'

export const DEFAULT_REGION_ID = 'SNDK'

export const WEATHER_SOURCE_LABELS = {
  manuel: 'Région sélectionnée manuellement',
  geolocation: 'Météo chargée depuis votre position',
  fallback: 'Dakar chargé par défaut',
}

const state = reactive({
  selectedRegionId: DEFAULT_REGION_ID,
  region: getRegionById(DEFAULT_REGION_ID),
  weather: null,
  loading: false,
  error: null,
  source: 'manuel',
  geolocationMessage: null,
  risk: null,
//   recommandations: [],
//   recommandationsLoading: false,
})


// export function setRecommandations(recommandations) {
//   state.recommandations = recommandations
//   state.recommandationsLoading = false
// }

// export function setRecommandationsLoading() {
//   state.recommandationsLoading = true
// }


export function getClimatState() {
  return state
}

export function setSelectedRegion(regionId) {
  const region = getRegionById(regionId)

  if (!region) {
    throw new Error(`Région inconnue : ${regionId}`)
  }

  state.selectedRegionId = region.id
  state.region = region
  state.weather = null
  state.loading = false
  state.error = null
  state.source = 'manuel'
  state.geolocationMessage = null
}

export function setWeatherLoading() {
  state.loading = true
  state.error = null
}

export async function setWeatherSuccess(weather, source = 'manuel', geolocationMessage = null) {
  state.weather = weather
  state.loading = false
  state.error = null
  state.source = source
  state.geolocationMessage = geolocationMessage
//   state.risk = await calculateRiskLLM(weather?.temp, weather?.humidity)  // ← LLM
}

export function setWeatherError(error) {
  state.loading = false
  state.error = error
}

export function clearWeather() {
  state.weather = null
  state.loading = false
  state.error = null
  state.source = 'manuel'
  state.geolocationMessage = null
}
