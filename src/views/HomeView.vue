<script setup>
import { ref } from 'vue'

import CartAffiche from '@/components/dashbord/CartAffiche.vue'
import SenegalMap from '@/components/Map/SenegalMap.vue'

import { useClimat } from '@/services/useClimat'

const isCartAfficheOpen = ref(false)

const {
  selectedRegion,
  selectedRegionId,
  weather,
  risk,
  selectRegion,
} = useClimat()

async function recuperationEmit(regionId) {
  try {
    isCartAfficheOpen.value = true

    await selectRegion(regionId)
  } catch (error) {
    console.error(error)
  }
}

function closeCartAffiche() {
  isCartAfficheOpen.value = false
}
</script>

<template>
  <main class="dashboard">
    <section class="dashboard__map">
      <SenegalMap :selected-region="selectedRegionId" @region-select="recuperationEmit" />
    </section>

    <!-- CartAffiche se comporte comme un sidebar droit et s'affiche apres un clic sur la carte. -->
    <CartAffiche
      :region="selectedRegion?.name"
      :weather="weather"
      :risk="risk"
      :visible="isCartAfficheOpen"
      @close="closeCartAffiche"
    />
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  overflow-x: hidden;
  background: #f3f8f4;
}

.dashboard__map {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
}

.dashboard__map :deep(svg) {
  width: min(1000px, 100%);
  height: auto;
  cursor: pointer;
}

</style>
