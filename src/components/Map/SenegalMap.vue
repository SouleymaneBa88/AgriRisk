<script>
import { senegalRegionsFromSvg } from '../../data/regionsFromSvg'

export default {
  name: 'SenegalMap',
  props: {
    // on reçoit l'id SVG, ex: 'SNDK'
    selectedRegion: {
      type: String,
      default: null,
    },
  },
  emits: ['region-select'],
  data() {
    return {
      regions: senegalRegionsFromSvg,
      hoverRegion: null,
      labels: [
        { id: 'SNKE', name: 'Kédougou',    cx: 813.2, cy: 626.1 },
        { id: 'SNTC', name: 'Tambacounda', cx: 703.3, cy: 455.4 },
        { id: 'SNKD', name: 'Kolda',       cx: 472.4, cy: 595.8 },
        { id: 'SNSE', name: 'Sédhiou',     cx: 324.7, cy: 595.9 },
        { id: 'SNZG', name: 'Ziguinchor',  cx: 228.7, cy: 614.8 },
        { id: 'SNSL', name: 'Saint-Louis', cx: 440.3, cy: 90.3 },
        { id: 'SNMT', name: 'Matam',       cx: 602.2, cy: 269 },
        { id: 'SNKA', name: 'Kaffrine',    cx: 390.5, cy: 415.1 },
        { id: 'SNKL', name: 'Kaolack',     cx: 274.8, cy: 467.3 },
        { id: 'SNFK', name: 'Fatick',      cx: 212.2, cy: 381.8 },
        { id: 'SNLG', name: 'Louga',       cx: 354.5, cy: 231.2 },
        { id: 'SNTH', name: 'Thiès',       cx: 141.4, cy: 333.2 },
        { id: 'SNDK', name: 'Dakar',       cx: 88.4,  cy: 325.8 },
        { id: 'SNDB', name: 'Diourbel',    cx: 269.2, cy: 329 },
      ],
    }
  },
  methods: {
    onRegionClick(regionId) {
      this.$emit('region-select', regionId)
    },
    regionClass(regionId) {
      return [
        'region',
        { 'region--selected': this.selectedRegion === regionId },
        { 'region--hover': this.hoverRegion === regionId },
      ]
    },
  },
}
</script>

<template>
  <svg
    baseProfile="tiny"
    class="w-full h-auto max-h-[400px] md:max-h-[460px]"
    stroke="#ffffff"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width=".5"
    version="1.2"
    viewBox="0 0 1000 736"
    xmlns="http://www.w3.org/2000/svg"
   >
    <g id="features">
      <path
        v-for="region in regions"
        :key="region.id"
        :id="region.id"
        :name="region.name"
        :d="region.d"
        :class="regionClass(region.id)"
        @click="onRegionClick(region.id)"
        @mouseenter="hoverRegion = region.id"
        @mouseleave="hoverRegion = null"
      />
    </g>

    <!-- Labels des régions -->
    <g id="labels">
      <text
        v-for="label in labels"
        :key="label.id"
        :x="label.cx"
        :y="label.cy"
        class="region-label"
      >
        {{ label.name }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
.region {
  fill: #55c96b;
  cursor: pointer;
  transition: fill 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease;
}

.region--hover {
  opacity: 0.8;
  fill: #55c96b;
}

.region--selected {
  fill: #04240b;
  stroke-width: 1;
}

.region-label {
    font-size: 24px;
    font-weight: 600;
    fill: #111827;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
}

@media (max-width: 640px) {
  .region-label {
    font-size: 16px;
  }
}
</style>