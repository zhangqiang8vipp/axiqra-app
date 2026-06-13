import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import './styles/main.css'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

const authStore = useAuthStore()
if (authStore.isLoggedIn) {
  authApi.getMe()
    .then((res) => {
      if (res.data.code === 0 && res.data.data) {
        authStore.setUser(res.data.data)
      } else {
        authStore.clearAuth()
      }
    })
    .catch(() => {
      authStore.clearAuth()
    })
}

app.mount('#app')
