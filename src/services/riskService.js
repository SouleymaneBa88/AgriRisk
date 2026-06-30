const RISK_LEVELS = [
  { max: 24, label: 'Faible', color: '#2f9e44', tone: 'low' },
  { max: 49, label: 'Modere', color: '#f08c00', tone: 'medium' },
  { max: 74, label: 'Eleve', color: '#e03131', tone: 'high' },
  { max: 100, label: 'Critique', color: '#862e9c', tone: 'critical' },
]

/**
 * Calcule un indice de risque agricole simple a partir des mesures meteo.
 * Le score reste local et explicable: stress thermique, humidite, vent et
 * pression contribuent chacun a une part du risque total.
 */
export function calculateAgriculturalRisk(weather) {
  if (!weather) {
    return null
  }

  const factors = [
    buildFactor('temperature', 'Temperature', scoreTemperature(weather.temp), 'Stress thermique'),
    buildFactor('humidity', 'Humidite', scoreHumidity(weather.humidity), 'Risque hydrique'),
    buildFactor('wind', 'Vent', scoreWind(weather.windSpeed), 'Dessèchement'),
    buildFactor('pressure', 'Pression', scorePressure(weather.pressure), 'Instabilite'),
  ]

  const availableFactors = factors.filter((factor) => factor.value !== null)

  if (!availableFactors.length) {
    return null
  }

  const score = Math.round(
    availableFactors.reduce((total, factor) => total + factor.value, 0) /
      availableFactors.length
  )
  const level = RISK_LEVELS.find((item) => score <= item.max) || RISK_LEVELS.at(-1)

  return {
    score,
    label: level.label,
    color: level.color,
    tone: level.tone,
    factors: availableFactors,
    summary: getRiskSummary(score, weather),
  }
}

function buildFactor(id, label, value, hint) {
  return {
    id,
    label,
    hint,
    value,
  }
}

function scoreTemperature(temp) {
  const value = toNumber(temp)
  if (value === null) return null
  if (value < 12) return 45
  if (value <= 30) return 15
  if (value <= 34) return 40
  if (value <= 38) return 70
  return 92
}

function scoreHumidity(humidity) {
  const value = toNumber(humidity)
  if (value === null) return null
  if (value < 25) return 75
  if (value <= 70) return 20
  if (value <= 85) return 45
  return 70
}

function scoreWind(windSpeed) {
  const value = toNumber(windSpeed)
  if (value === null) return null
  if (value <= 15) return 15
  if (value <= 30) return 40
  if (value <= 45) return 65
  return 90
}

function scorePressure(pressure) {
  const value = toNumber(pressure)
  if (value === null) return null
  const distanceFromStable = Math.abs(value - 1013)
  if (distanceFromStable <= 8) return 15
  if (distanceFromStable <= 18) return 35
  if (distanceFromStable <= 30) return 60
  return 85
}

function getRiskSummary(score, weather) {
  if (score >= 75) {
    return 'Surveillance prioritaire conseillee pour les cultures sensibles.'
  }

  if (score >= 50) {
    return 'Conditions a suivre, surtout pour les jeunes plants et les sols nus.'
  }

  if (score >= 25) {
    return 'Risque present mais contenu avec un suivi regulier.'
  }

  if (weather?.conditionFr) {
    return `Conditions globalement favorables: ${weather.conditionFr}.`
  }

  return 'Conditions globalement favorables pour les travaux agricoles.'
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
