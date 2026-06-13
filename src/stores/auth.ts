import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CurrentUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('axiqra_token'))
  const user = ref<CurrentUser | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const displayName = computed(() =>
    user.value?.nickname || user.value?.username || '',
  )
  const avatarUrl = computed(() => user.value?.avatar || null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('axiqra_token', newToken)
  }

  function setUser(userInfo: CurrentUser) {
    user.value = userInfo
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('axiqra_token')
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    displayName,
    avatarUrl,
    setToken,
    setUser,
    clearAuth,
  }
})
