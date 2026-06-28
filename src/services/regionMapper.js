import { REGIONS, getRegionById } from '@/data/regions'

const SENEGAL_BOUNDS = {
  minLat: 12.25,
  maxLat: 16.7,
  minLon: -17.65,
  maxLon: -11.3,
}

export function isInsideSenegal(lat, lon) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= SENEGAL_BOUNDS.minLat &&
    lat <= SENEGAL_BOUNDS.maxLat &&
    lon >= SENEGAL_BOUNDS.minLon &&
    lon <= SENEGAL_BOUNDS.maxLon
  )
}

export function getRegionIdFromCoordinates(lat, lon) {
  if (!isInsideSenegal(lat, lon)) {
    return null
  }

  let nearestRegion = null
  let nearestDistance = Infinity

  for (const region of REGIONS) {
    const distance = haversineDistance(lat, lon, region.lat, region.lon)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestRegion = region
    }
  }

  return nearestRegion?.id || null
}

export function getRegionCodeFromCoordinates(lat, lon) {
  const region = getRegionFromCoordinates(lat, lon)
  return region?.code || null
}

export function getRegionFromCoordinates(lat, lon) {
  const regionId = getRegionIdFromCoordinates(lat, lon)
  return regionId ? getRegionById(regionId) : null
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const radius = 6371
  const toRadians = (value) => (value * Math.PI) / 180
  const deltaLat = toRadians(lat2 - lat1)
  const deltaLon = toRadians(lon2 - lon1)
  const startLat = toRadians(lat1)
  const endLat = toRadians(lat2)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLon / 2) ** 2

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
