const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

export class ErreurApiMeteo extends Error {
  constructor(message, code, statusCode = null, details = null) {
    super(message)
    this.name = 'ErreurApiMeteo'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

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

function arrondirNombre(value, digits = 1) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return null
  }

  return Number(number.toFixed(digits))
}

function toNullableNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function getWindDirection(degrees) {
  if (!Number.isFinite(degrees)) {
    return 'Variable'
  }

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return directions[Math.round(degrees / 45) % 8]
}
