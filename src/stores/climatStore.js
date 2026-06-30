import { reactive } from 'vue'
import { getRegionById } from '@/data/regions'
import { calculateAgriculturalRisk } from '@/services/riskService'

export const DEFAULT_REGION_ID = 'SNDK'

/**
 * Libellés affichés selon l'origine des données météo actuellement chargées.
 */
export const WEATHER_SOURCE_LABELS = {
  manuel: 'Région sélectionnée manuellement',
  geolocation: 'Météo chargée depuis votre position',
  fallback: 'Dakar chargé par défaut',
}

/**
 * Etat partagé du module climat. Comme il est créé avec reactive(), les vues et
 * composables qui le consomment sont automatiquement mis à jour.
 */
const state = reactive({
  selectedRegionId: DEFAULT_REGION_ID,
  region: getRegionById(DEFAULT_REGION_ID),
  weather: null,
  forecast: [],
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


/**
 * Donne accès à l'état climat centralisé.
 */
export function getClimatState() {
  return state
}

/**
 * Change la région sélectionnée et remet les données météo courantes à zéro.
 */
export function setSelectedRegion(regionId) {
  const region = getRegionById(regionId)

  if (!region) {
    throw new Error(`Région inconnue : ${regionId}`)
  }

  state.selectedRegionId = region.id
  state.region = region
  state.weather = null
  state.forecast = []
  state.loading = false
  state.error = null
  state.source = 'manuel'
  state.geolocationMessage = null
  state.risk = null
}

/**
 * Place le module en état de chargement avant une requête météo.
 */
export function setWeatherLoading() {
  state.loading = true
  state.error = null
}

/**
 * Enregistre une météo chargée avec succès et mémorise son origine.
 */
export async function setWeatherSuccess(weather, forecast = [], source = 'manuel', geolocationMessage = null) {
  state.weather = weather
  state.forecast = forecast
  state.loading = false
  state.error = null
  state.source = source
  state.geolocationMessage = geolocationMessage
  state.risk = calculateAgriculturalRisk(weather)
}

/**
 * Enregistre l'erreur météo et arrête l'état de chargement.
 */
export function setWeatherError(error) {
  state.loading = false
  state.error = error
  state.forecast = []
  state.risk = null
}

/**
 * Vide la météo courante sans changer la région sélectionnée.
 */
export function clearWeather() {
  state.weather = null
  state.forecast = []
  state.loading = false
  state.error = null
  state.source = 'manuel'
  state.geolocationMessage = null
  state.risk = null
}
