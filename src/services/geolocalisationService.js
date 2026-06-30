import { getRegionById } from '@/data/regions'
import { getRegionIdFromCoordinates } from './regionMapper'

/**
 * Erreur métier utilisée pour normaliser les différents retours de l'API
 * Geolocation du navigateur.
 */
export class ErreurGeolocalisation extends Error {
  constructor(message, code, details = null) {
    super(message)
    this.name = 'ErreurGeolocalisation'
    this.code = code
    this.details = details
  }
}

/**
 * Récupère la position de l'utilisateur puis l'associe à une région du Sénégal.
 * Si la position est refusée, indisponible ou hors Sénégal, une région de repli
 * est retournée pour permettre au dashboard de rester utilisable.
 *
 * @param {object} options Options de géolocalisation.
 * @param {string} [options.fallbackRegionId='SNDK'] Région utilisée en cas d'échec.
 * @returns {Promise<{region: object, source: string, reason?: string, error?: Error}>}
 */
export async function getRegionFromPosition({ fallbackRegionId = 'SNDK' } = {}) {
  try {
    const position = await getPositionActuelle()
    const regionId = getRegionIdFromCoordinates(
      position.coords.latitude,
      position.coords.longitude
    )

    if (!regionId) {
      return {
        region: getRegionById(fallbackRegionId),
        source: 'fallback',
        reason: 'outside_senegal',
      }
    }

    return {
      region: getRegionById(regionId),
      source: 'geolocation',
    }
  } catch (error) {
    if (error instanceof ErreurGeolocalisation) {
      return {
        region: getRegionById(fallbackRegionId),
        source: 'fallback',
        reason: error.code,
        error,
      }
    }

    throw error
  }
}

/**
 * Enveloppe navigator.geolocation.getCurrentPosition dans une Promise.
 *
 * @returns {Promise<GeolocationPosition>} Position navigateur actuelle.
 * @throws {ErreurGeolocalisation} Si le navigateur ne supporte pas la géolocalisation.
 */
export async function getPositionActuelle() {
  if (!navigator.geolocation) {
    throw new ErreurGeolocalisation(
      'La géolocalisation n\'est pas disponible dans ce navigateur.',
      'unsupported'
    )
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        reject(creerErreurGeolocalisation(error))
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 600000,
      }
    )
  })
}

/**
 * Transforme une erreur de géolocalisation en texte court pour l'interface.
 */
export function getMessageErreurGeolocalisation(error) {
  switch (error?.code) {
    case 'permission_denied':
      return 'Autorisation de position refusée.'
    case 'position_unavailable':
      return 'Position indisponible.'
    case 'timeout':
      return 'Délai de géolocalisation dépassé.'
    case 'unsupported':
      return 'Géolocalisation non disponible.'
    default:
      return error?.message || 'Impossible de récupérer votre position.'
  }
}

/**
 * Vérifie en amont si l'utilisateur a déjà refusé la géolocalisation.
 * Cette fonction est disponible si l'on veut éviter d'ouvrir le prompt navigateur.
 */
async function refuserSiPermissionRefusee() {
  if (!navigator.permissions?.query) {
    return
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })

    if (permission.state === 'denied') {
      throw new ErreurGeolocalisation(
        'L\'autorisation de position a été refusée.',
        'permission_denied'
      )
    }
  } catch (error) {
    if (error instanceof ErreurGeolocalisation) {
      throw error
    }
  }
}

/**
 * Convertit les codes natifs GeolocationPositionError en ErreurGeolocalisation.
 */
function creerErreurGeolocalisation(error) {
  if (error.code === error.PERMISSION_DENIED) {
    return new ErreurGeolocalisation(
      'L\'autorisation de position a été refusée.',
      'permission_denied'
    )
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return new ErreurGeolocalisation(
      'La position est indisponible.',
      'position_unavailable'
    )
  }

  if (error.code === error.TIMEOUT) {
    return new ErreurGeolocalisation(
      'Le temps de récupération de la position a expiré.',
      'timeout'
    )
  }

  return new ErreurGeolocalisation(
    error.message || 'Impossible de récupérer votre position.',
    'unknown'
  )
}
