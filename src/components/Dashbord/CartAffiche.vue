<script setup>
import sidebar from './sidebar.vue';

defineProps({
  region: {
    type: String,
    default: '',
  },
  visible: {
    type: Boolean,
    default: false,
  },
  weather: {
    type: Object,
    default: null,
  },
  forecast: {
    type: Array,
    default: () => [],
  },
  risk: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <aside class="cart-affiche" :class="{ 'cart-affiche--open': visible }" aria-live="polite">
    <div class="cart-affiche__header">
      <div>
        <span class="cart-affiche__label">Region selectionnee</span>
        <h2>{{ region || 'Aucune region' }}</h2>
      </div>
      <button class="cart-affiche__close" type="button" aria-label="Fermer le panneau" @click="emit('close')">
        x
      </button>
    </div>

    <!-- Ce bloc centralise les informations affichees apres un clic sur une region de la carte. -->
    <section v-if="region" class="cart-affiche__content">
      <sidebar :region="region" :weather="weather" :forecast="forecast" :risk="risk" />
    </section>

    <p v-else class="cart-affiche__empty">Cliquez sur une region de la carte pour afficher ses details.</p>
  </aside>
</template>

<style scoped>
.cart-affiche {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 20;
  width: min(380px, 92vw);
  height: 100vh;
  padding: 24px;
  overflow-y: auto;
  background: #ffffff;
  border-left: 1px solid #d9e6dc;
  box-shadow: -16px 0 32px rgba(32, 59, 42, 0.14);
  transform: translateX(105%);
  transition: transform 0.25s ease;
}

.cart-affiche--open {
  transform: translateX(0);
}

.cart-affiche__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e7efe9;
}

.cart-affiche__label {
  display: block;
  margin-bottom: 6px;
  color: #5c7d65;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.cart-affiche__header h2 {
  margin: 0;
  color: #213d2a;
  font-size: 1.45rem;
}

.cart-affiche__close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid #d6e4da;
  border-radius: 8px;
  background: #f4faf6;
  color: #213d2a;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
}

.cart-affiche__content,
.cart-affiche__empty {
  margin-top: 22px;
}

.cart-affiche__empty {
  color: #4a6652;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .cart-affiche {
    width: 100vw;
    padding: 18px;
  }
}
</style>
