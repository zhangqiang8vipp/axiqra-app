<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

const isValid = computed(() =>
  username.value.trim() &&
  email.value.trim() &&
  password.value &&
  password.value === confirmPassword.value &&
  password.value.length >= 8,
)

async function handleRegister() {
  if (!isValid.value || loading.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await authApi.register({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })
    if (res.data.code === 0 && res.data.data) {
      authStore.setToken(res.data.data.token)
      authStore.setUser(res.data.data)
      router.push('/dashboard')
    } else {
      errorMsg.value = res.data.message || t('auth.registerFailed')
    }
  } catch {
    errorMsg.value = t('auth.networkError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">{{ t('auth.registerTitle') }}</h1>
        <p class="auth-subtitle">{{ t('auth.registerSubtitle') }}</p>
      </div>

      <form class="auth-form" @submit.prevent="handleRegister">
        <div v-if="errorMsg" class="alert alert-error">
          {{ errorMsg }}
        </div>

        <div class="form-group">
          <label class="form-label" for="username">{{ t('auth.username') }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            class="form-input"
            :placeholder="t('auth.usernamePlaceholder')"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">{{ t('auth.email') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            :placeholder="t('auth.emailPlaceholder')"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">{{ t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            :placeholder="t('auth.passwordPlaceholder')"
            autocomplete="new-password"
            required
          />
          <span class="form-hint">{{ t('auth.passwordHint') }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="confirm">{{ t('auth.confirmPassword') }}</label>
          <input
            id="confirm"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            :placeholder="t('auth.confirmPlaceholder')"
            autocomplete="new-password"
            required
          />
          <span
            v-if="confirmPassword && password !== confirmPassword"
            class="form-error"
          >
            {{ t('auth.passwordMismatch') }}
          </span>
        </div>

        <button type="submit" class="btn-submit" :disabled="!isValid || loading">
          <span v-if="loading" class="spinner" />
          {{ loading ? t('auth.registering') : t('auth.registerBtn') }}
        </button>
      </form>

      <p class="auth-footer">
        {{ t('auth.hasAccount') }}
        <RouterLink to="/login" class="auth-link">{{ t('auth.loginNow') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - var(--header-height) - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-6);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: var(--space-8);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.auth-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.auth-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.alert {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input::placeholder {
  color: var(--color-text-tertiary);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-error);
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.auth-footer {
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.auth-link {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
