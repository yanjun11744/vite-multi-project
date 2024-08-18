/*
 * @Author: Shber
 * @Date: 2024-01-19 14:59:13
 * @LastEditors: Shber
 * @LastEditTime: 2024-01-22 19:55:55
 * @Description: 
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'page',
      component: () => import('@projects/page/views/example.vue'),
      meta: {title: '独立页面'}
    }
  ]
})

export default router
