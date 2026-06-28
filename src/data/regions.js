export const REGIONS = [
  {
    id: 'SNDK',
    name: 'Dakar',
    code: 'dakar',
    lat: 14.6937,
    lon: -17.4441,
  },
  {
    id: 'SNTH',
    name: 'Thiès',
    code: 'thies',
    lat: 14.7833,
    lon: -16.9167,
  },
  {
    id: 'SNDB',
    name: 'Diourbel',
    code: 'diourbel',
    lat: 14.65,
    lon: -16.4,
  },
  {
    id: 'SNFK',
    name: 'Fatick',
    code: 'fatick',
    lat: 14.3417,
    lon: -16.41,
  },
  {
    id: 'SNKL',
    name: 'Kaolack',
    code: 'kaolack',
    lat: 14.15,
    lon: -16.1,
  },
  {
    id: 'SNKA',
    name: 'Kaffrine',
    code: 'kaffrine',
    lat: 14.45,
    lon: -15.55,
  },
  {
    id: 'SNLG',
    name: 'Louga',
    code: 'louga',
    lat: 15.6167,
    lon: -16.2167,
  },
  {
    id: 'SNSL',
    name: 'Saint-Louis',
    code: 'saint-louis',
    lat: 16.0333,
    lon: -16.5,
  },
  {
    id: 'SNMT',
    name: 'Matam',
    code: 'matam',
    lat: 15.1667,
    lon: -13.2667,
  },
  {
    id: 'SNKD',
    name: 'Kolda',
    code: 'kolda',
    lat: 12.8833,
    lon: -14.9333,
  },
  {
    id: 'SNZG',
    name: 'Ziguinchor',
    code: 'ziguinchor',
    lat: 12.5833,
    lon: -16.2667,
  },
  {
    id: 'SNTC',
    name: 'Tambacounda',
    code: 'tambacounda',
    lat: 13.7667,
    lon: -13.6833,
  },
  {
    id: 'SNSE',
    name: 'Sédhiou',
    code: 'sedhiou',
    lat: 12.7083,
    lon: -15.55,
  },
  {
    id: 'SNKE',
    name: 'Kédougou',
    code: 'kedougou',
    lat: 12.55,
    lon: -12.1833,
  },
]

export const REGION_MAP = Object.fromEntries(
  REGIONS.map((r) => [r.id, r])
)

/**
 * Retourne une région par son identifiant SVG.
 */
export function getRegionById(id) {
  return REGION_MAP[id]
}
