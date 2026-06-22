import { createRouter, createWebHistory } from 'vue-router'
import Cart from '@/components/cart.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Cart,
    }
  ]
})

export default router
