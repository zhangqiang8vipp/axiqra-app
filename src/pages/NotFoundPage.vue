<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-code">404</div>
      <h1 class="error-title">{{ t('error.notFound') }}</h1>
      <p class="error-desc">{{ t('error.notFoundDesc') }}</p>
      <button class="btn-home" @click="router.push('/')">
        {{ t('error.goHome') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: calc(100vh - var(--header-height) - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.error-card {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-border);
  margin-bottom: var(--space-4);
}

.error-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.error-desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
}

.btn-home {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-home:hover {
  background: var(--color-primary-hover);
}
</style>
