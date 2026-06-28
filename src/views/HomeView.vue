<script setup>
import CartAffiche from '@/components/Dashbord/CartAffiche.vue';
import SenegalMap from '@/components/Map/SenegalMap.vue';
import { ref } from 'vue';

const selectRegion = ref('Dakar')
const isCartAfficheOpen = ref(true)

function recuperationEmit(region) {
  // Ouvre le panneau lateral droit avec la region recue depuis le composant carte.
  selectRegion.value = region
  isCartAfficheOpen.value = true
}

function closeCartAffiche() {
  isCartAfficheOpen.value = false
}
</script>

<template>
  <main class="dashboard">
    <section class="dashboard__map">
      <SenegalMap :selected-region="selectRegion" @selection-region="recuperationEmit" />
    </section>

    <!-- CartAffiche se comporte comme un sidebar droit et s'affiche apres un clic sur la carte. -->
    <CartAffiche :region="selectRegion" :visible="isCartAfficheOpen" @close="closeCartAffiche" />
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
