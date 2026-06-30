import { computed, watch } from 'vue'
import { fetchForecastByRegion, fetchWeatherByRegion, getMessageErreurMeteo } from '@/services/climatService'
import { getRegionFromPosition } from '@/services/geolocalisationService'
// import { getRecommendations } from '@/services/recommendationLLM'
import {
  DEFAULT_REGION_ID,
  WEATHER_SOURCE_LABELS,
  clearWeather,
  getClimatState,
  setWeatherError,
  setWeatherLoading,
  setWeatherSuccess,
  setSelectedRegion,
//   setRecommandations,
//   setRecommandationsLoading,
} from '@/stores/climatStore'
// import { useAlertStore } from '../stores/alertStore'

const fallbackMessages = {
  outside_senegal:     'Position hors Sénégal : Dakar chargé par défaut.',
  permission_denied:   'Autorisation refusée : Dakar chargé par défaut.',
  unsupported:         'Géolocalisation non disponible : Dakar chargé par défaut.',
  position_unavailable:'Position indisponible : Dakar chargé par défaut.',
  timeout:             'Délai de géolocalisation dépassé : Dakar chargé par défaut.',
}

/**
 * Composable principal du dashboard climat.
 * Il expose l'état météo sous forme de computed et centralise les actions
 * de sélection de région, chargement par défaut et géolocalisation.
 */
export function useClimat() {
  const state = getClimatState()
  // const alertStore = useAlertStore()

  const selectedRegionId = computed({
    get: () => state.selectedRegionId,
    set: (regionId) => selectRegion(regionId),
  })

  const selectedRegion        = computed(() => state.region)
  const weather               = computed(() => state.weather)
  const forecast              = computed(() => state.forecast)
  const loading               = computed(() => state.loading)
  const error                 = computed(() => state.error)
  const risk                  = computed(() => state.risk)
//   const recommandations       = computed(() => state.recommandations)
//   const recommandationsLoading = computed(() => state.recommandationsLoading)

  // watch(weather, (newWeather) => {
  //   if (newWeather && !loading.value) {
  //     alertStore.updateWeather({
  //       temp: newWeather.temp,
  //       feelsLike: newWeather.feelsLike,
  //       humidity: newWeather.humidity,
  //       windSpeed: newWeather.windSpeed,
  //       windDirection: newWeather.windDirection,
  //       description: newWeather.conditionFr,
  //       regionName: selectedRegion.value?.name || null,
  //     })
  //     alertStore.computeAlert()
  //     alertStore.generateAlertMessage()
  //   }
  // }, { deep: true })

  const sourceLabel = computed(() => {
    if (state.geolocationMessage) return state.geolocationMessage
    return WEATHER_SOURCE_LABELS[state.source] || 'Région sélectionnée'
  })

  const errorMessage = computed(() =>
    error.value ? getMessageErreurMeteo(error.value) : null
  )

  /**
   * Sélectionne une région, charge sa météo et met à jour le store climat.
   */
  async function selectRegion(regionId) {
    try {
      setSelectedRegion(regionId)
      setWeatherLoading()

      const [nextWeather, nextForecast] = await Promise.all([
        fetchWeatherByRegion(state.region),
        fetchForecastByRegion(state.region),
      ])

      // 1. Calcul météo + risque (setWeatherSuccess appelle calculateRiskLLM)
      await setWeatherSuccess(nextWeather, nextForecast, 'manuel')

      // 2. Génération des recommandations basées sur le risque calculé
      //    Lancée en parallèle de l'affichage du dashboard (non bloquante)
    //   if (state.risk && state.weather) {
    //     setRecommandationsLoading()
    //     const recs = await getRecommendations(
    //       state.risk,
    //       state.weather.temp,
    //       state.weather.humidity,
    //       state.region.name,
    //     )
    //     setRecommandations(recs)
    //   }

    } catch (caughtError) {
      setWeatherError(caughtError)
    }
  }

  /**
   * Charge la météo de la région configurée comme valeur par défaut.
   */
  async function loadDefaultWeather() {
    await selectRegion(DEFAULT_REGION_ID)
  }

  /**
   * Tente de charger la météo depuis la position GPS de l'utilisateur.
   * En cas d'échec géré, le service de géolocalisation renvoie Dakar en fallback.
   */
  async function useMyPosition() {
    try {
      state.loading = true
      state.error = null
      state.weather = null
      const result = await getRegionFromPosition({ fallbackRegionId: DEFAULT_REGION_ID })
      const geolocationMessage = result.reason
        ? fallbackMessages[result.reason]
        : 'Météo chargée depuis votre position au Sénégal.'
      await selectRegion(result.region.id)
      state.source = result.source
      state.geolocationMessage = geolocationMessage
    } catch (caughtError) {
      setWeatherError(caughtError)
    }
  }

  return {
    selectedRegionId,
    selectedRegion,
    weather,
    forecast,
    risk,
    // recommandations,         // ← nouveau
    // recommandationsLoading,  // ← nouveau
    loading,
    error,
    errorMessage,
    sourceLabel,
    selectRegion,
    loadDefaultWeather,
    useMyPosition,
    clearWeather,
  }
}
