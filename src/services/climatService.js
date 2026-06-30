import { calculateAgriculturalRisk } from '@/services/riskService'

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

/**
 * Erreur métier utilisée pour convertir les erreurs OpenWeatherMap, réseau
 * ou configuration en codes faciles à afficher dans l'interface.
 */
export class ErreurApiMeteo extends Error {
  constructor(message, code, statusCode = null, details = null) {
    super(message)
    this.name = 'ErreurApiMeteo'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Récupère la clé API OpenWeatherMap depuis les variables Vite.
 *
 * @returns {string} Clé API à utiliser dans les requêtes météo.
 * @throws {ErreurApiMeteo} Si la variable VITE_OPENWEATHER_API_KEY est absente.
 */
export function getOpenWeatherApiKey() {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

  if (!apiKey) {
    throw new ErreurApiMeteo(
      'La clé API OpenWeatherMap n\'est pas configurée.',
      'missing_api_key'
    )
  }

  return apiKey
}

/**
 * Charge la météo actuelle d'une région depuis OpenWeatherMap.
 *
 * @param {object} region Région sélectionnée, avec au minimum id, name, lat et lon.
 * @param {AbortSignal} [signal] Signal optionnel pour annuler la requête fetch.
 * @returns {Promise<object>} Données météo normalisées pour le dashboard.
 * @throws {ErreurApiMeteo} Si la région, la configuration ou l'appel API échoue.
 */
export async function fetchWeatherByRegion(region, signal) {
  if (!region?.lat || !region?.lon) {
    throw new ErreurApiMeteo('Cette région ne possède pas de coordonnées.', 'invalid_region')
  }

  const apiKey = getOpenWeatherApiKey()
  const url = new URL(OPENWEATHER_BASE_URL)

  url.searchParams.set('lat', region.lat)
  url.searchParams.set('lon', region.lon)
  url.searchParams.set('units', 'metric')
  url.searchParams.set('lang', 'fr')
  url.searchParams.set('appid', apiKey)

  try {
    const response = await fetch(url, { signal })

    if (!response.ok) {
      throw await creerErreurApiMeteo(response)
    }

    const data = await response.json()
    return normaliserDonneesMeteo(data, region)
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ErreurApiMeteo('Le chargement météo a été annulé.', 'aborted')
    }

    if (error instanceof ErreurApiMeteo) {
      throw error
    }

    throw new ErreurApiMeteo(
      'Impossible de contacter OpenWeatherMap. Vérifiez votre connexion.',
      'network_error'
    )
  }
}

/**
 * Charge la prévision météo sur 5 jours et la regroupe en un point par jour.
 *
 * @param {object} region Région sélectionnée, avec au minimum id, name, lat et lon.
 * @param {AbortSignal} [signal] Signal optionnel pour annuler la requête fetch.
 * @returns {Promise<Array<object>>} Points journaliers pour la courbe du dashboard.
 */
export async function fetchForecastByRegion(region, signal) {
  if (!region?.lat || !region?.lon) {
    throw new ErreurApiMeteo('Cette région ne possède pas de coordonnées.', 'invalid_region')
  }

  const apiKey = getOpenWeatherApiKey()
  const url = new URL(OPENWEATHER_FORECAST_URL)

  url.searchParams.set('lat', region.lat)
  url.searchParams.set('lon', region.lon)
  url.searchParams.set('units', 'metric')
  url.searchParams.set('lang', 'fr')
  url.searchParams.set('appid', apiKey)

  try {
    const response = await fetch(url, { signal })

    if (!response.ok) {
      throw await creerErreurApiMeteo(response)
    }

    const data = await response.json()
    return normaliserPrevisionsMeteo(data)
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ErreurApiMeteo('Le chargement météo a été annulé.', 'aborted')
    }

    if (error instanceof ErreurApiMeteo) {
      throw error
    }

    throw new ErreurApiMeteo(
      'Impossible de contacter OpenWeatherMap. Vérifiez votre connexion.',
      'network_error'
    )
  }
}

/**
 * Transforme une erreur technique en message clair pour l'utilisateur.
 *
 * @param {Error|ErreurApiMeteo} error Erreur capturée pendant le chargement météo.
 * @returns {string} Message prêt à afficher dans l'interface.
 */
export function getMessageErreurMeteo(error) {
  if (error?.name === 'AbortError') {
    return 'Le chargement météo a été annulé.'
  }

  switch (error?.code) {
    case 'missing_api_key':
      return 'La clé API OpenWeatherMap est manquante. Ajoutez VITE_OPENWEATHER_API_KEY dans .env.local.'
    case 'unauthorized':
    case 'forbidden':
      return 'La clé API OpenWeatherMap est invalide ou refusée.'
    case 'not_found':
      return 'Aucune donnée météo n\'a été trouvée pour cette région.'
    case 'rate_limit':
      return 'Trop de requêtes ont été envoyées à OpenWeatherMap. Réessayez plus tard.'
    case 'network_error':
      return 'Impossible de contacter OpenWeatherMap. Vérifiez votre connexion internet.'
    case 'invalid_region':
      return 'La région sélectionnée ne peut pas être utilisée pour charger la météo.'
    default:
      return error?.message || 'Une erreur inattendue est survenue pendant le chargement météo.'
  }
}

/**
 * Convertit une réponse HTTP OpenWeatherMap non réussie en ErreurApiMeteo.
 *
 * @param {Response} response Réponse fetch avec statut HTTP en erreur.
 * @returns {Promise<ErreurApiMeteo>} Erreur enrichie avec le statut et le payload API.
 */
async function creerErreurApiMeteo(response) {
  let payload = {}

  try {
    payload = await response.json()
  } catch {
    payload = {}
  }

  const status = response.status

  if (status === 401) {
    return new ErreurApiMeteo(
      'La clé API OpenWeatherMap est invalide ou refusée.',
      'unauthorized',
      status,
      payload
    )
  }

  if (status === 403) {
    return new ErreurApiMeteo(
      'L\'accès à OpenWeatherMap est refusé.',
      'forbidden',
      status,
      payload
    )
  }

  if (status === 404) {
    return new ErreurApiMeteo(
      'Aucune donnée météo n\'a été trouvée pour cette région.',
      'not_found',
      status,
      payload
    )
  }

  if (status === 429) {
    return new ErreurApiMeteo(
      'Trop de requêtes ont été envoyées à OpenWeatherMap.',
      'rate_limit',
      status,
      payload
    )
  }

  return new ErreurApiMeteo(
    payload.message || 'OpenWeatherMap a retourné une erreur inattendue.',
    'api_error',
    status,
    payload
  )
}

/**
 * Adapte le format brut OpenWeatherMap au modèle de données utilisé par l'app.
 *
 * @param {object} data Réponse JSON OpenWeatherMap.
 * @param {object} region Région demandée.
 * @returns {object} Objet météo stable pour les composants Vue.
 */
function normaliserDonneesMeteo(data, region) {
  const weather = Array.isArray(data.weather) ? data.weather[0] : {}
  const windDeg = Number(data.wind?.deg)
  const windSpeed = Number(data.wind?.speed)

  return {
    id: data.id || `${region.id}-${Date.now()}`,
    regionId: region.id,
    regionName: region.name,
    regionCode: region.code,
    temp: arrondirNombre(data.main?.temp, 1),
    feelsLike: arrondirNombre(data.main?.feels_like, 1),
    humidity: toNullableNumber(data.main?.humidity),
    windSpeed: arrondirNombre(windSpeed, 1),
    windDeg: Number.isFinite(windDeg) ? windDeg : null,
    windDirection: getWindDirection(windDeg),
    pressure: toNullableNumber(data.main?.pressure),
    visibility: data.visibility ? `${Math.round(data.visibility / 1000)} km` : null,
    condition: weather.main || 'Inconnu',
    conditionFr: weather.description || weather.main || 'Inconnu',
    icon: weather.icon || '01d',
    iconUrl: `https://openweathermap.org/img/wn/${weather.icon || '01d'}@2x.png`,
    updatedAt: data.dt
      ? new Date(data.dt * 1000).toLocaleString('fr-SN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null,
    source: 'OpenWeatherMap',
  }
}

/**
 * Regroupe les prévisions toutes les 3 h en moyennes journalières sur 5 jours.
 */
function normaliserPrevisionsMeteo(data) {
  const groupedByDay = new Map()
  const items = Array.isArray(data.list) ? data.list : []

  items.forEach((item) => {
    const date = item.dt ? new Date(item.dt * 1000) : null

    if (!date) return

    const dayKey = date.toISOString().slice(0, 10)
    const current = groupedByDay.get(dayKey) || {
      date,
      temps: [],
      humidities: [],
      winds: [],
      pressures: [],
    }

    pushNumber(current.temps, item.main?.temp)
    pushNumber(current.humidities, item.main?.humidity)
    pushNumber(current.winds, item.wind?.speed)
    pushNumber(current.pressures, item.main?.pressure)
    groupedByDay.set(dayKey, current)
  })

  return Array.from(groupedByDay.values())
    .slice(0, 5)
    .map((day) => {
      const weather = {
        temp: moyenne(day.temps),
        humidity: Math.round(moyenne(day.humidities)),
        windSpeed: moyenne(day.winds),
        pressure: Math.round(moyenne(day.pressures)),
      }

      const risk = calculateAgriculturalRisk(weather)

      return {
        label: day.date.toLocaleDateString('fr-SN', { weekday: 'short' }),
        date: day.date.toISOString().slice(0, 10),
        temp: weather.temp,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        pressure: weather.pressure,
        riskScore: risk?.score ?? null,
      }
    })
}

/**
 * Arrondit une valeur numérique et renvoie null si la valeur est invalide.
 */
function arrondirNombre(value, digits = 1) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return null
  }

  return Number(number.toFixed(digits))
}

/**
 * Convertit une valeur en nombre ou null pour éviter les NaN dans l'interface.
 */
function toNullableNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function pushNumber(list, value) {
  const number = Number(value)

  if (Number.isFinite(number)) {
    list.push(number)
  }
}

function moyenne(values) {
  if (!values.length) {
    return null
  }

  return arrondirNombre(
    values.reduce((total, value) => total + value, 0) / values.length,
    1
  )
}

/**
 * Convertit un angle de vent en direction cardinale française simplifiée.
 */
function getWindDirection(degrees) {
  if (!Number.isFinite(degrees)) {
    return 'Variable'
  }

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return directions[Math.round(degrees / 45) % 8]
}
