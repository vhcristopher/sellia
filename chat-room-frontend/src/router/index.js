// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import WelcomePage from '../components/WelcomePage.vue';
import ChatRoom from '../components/ChatRoom.vue';

const routes = [
  { path: '/', component: WelcomePage },
  { path: '/chat', component: ChatRoom },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
