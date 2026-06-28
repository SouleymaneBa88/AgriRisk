import svgRaw from '@/assets/svg/sn.svg?raw'
import { REGION_MAP } from './regions'
import { SVG_LABELS } from './svgLabels'

function parseRegionsFromSvg(rawSvg) {
  const regions = []

  const pathRegex = /<path\s+([^>]+)>/g
  let match

  while ((match = pathRegex.exec(rawSvg)) !== null) {
    const attrs = match[1]

    const idMatch = attrs.match(/id="([^"]+)"/)
    const nameMatch = attrs.match(/name="([^"]+)"/)
    const dMatch = attrs.match(/d="([^"]+)"/)

    if (!idMatch || !dMatch) {
      continue
    }

    const id = idMatch[1]
    const name = nameMatch ? nameMatch[1] : id
    const d = dMatch[1]

    const ext = computeBBox(d)
    const cx = ext ? Math.round((ext.xmin + ext.xmax) / 2) : null
    const cy = ext ? Math.round((ext.ymin + ext.ymax) / 2) : null

    const label = SVG_LABELS[id]
    const ref = REGION_MAP[id]

    regions.push({
      id,
      name,
      d,
      code: ref ? ref.code : id,
      bbox: ext,
      cx: label ? label.cx : cx,
      cy: label ? label.cy : cy,
      lat: ref ? ref.lat : null,
      lon: ref ? ref.lon : null,
    })
  }

  return regions
}

function computeBBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+/g)
  if (!nums) {
    return null
  }
  const vals = nums.map(Number)
  const xs = vals.filter((_, i) => i % 2 === 0)
  const ys = vals.filter((_, i) => i % 2 !== 0)
  if (!xs.length || !ys.length) {
    return null
  }
  return {
    xmin: Math.min(...xs),
    ymin: Math.min(...ys),
    xmax: Math.max(...xs),
    ymax: Math.max(...ys),
  }
}

export const senegalRegionsFromSvg = parseRegionsFromSvg(svgRaw)
