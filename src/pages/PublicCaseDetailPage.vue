<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { publicCaseApi } from '@/api/publicCase'
import type { PublicCaseDetailVO, PublicCaseStatus } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const id = Number(route.params.id)
const detail = ref<PublicCaseDetailVO | null>(null)
const loading = ref(true)
const error = ref('')
const needsAuth = ref(false)

const statusLabel: Record<PublicCaseStatus, string> = {
  candidate: 'Candidate',
  reviewing: 'Reviewing',
  verified: 'Verified',
  stable: 'Stable',
  canonical: 'Canonical',
  archived: 'Archived',
}

onMounted(async () => {
  try {
    const res = await publicCaseApi.getById(id)
    if (res.data.code === 0 && res.data.data) {
      detail.value = res.data.data
    } else if (res.data.code === 401 || res.data.code === 403) {
      needsAuth.value = true
    } else {
      error.value = res.data.message || t('publicCasesDetail.loadError')
    }
  } catch (e: any) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      needsAuth.value = true
    } else {
      error.value = t('publicCasesDetail.loadError')
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="container">

      <!-- Back -->
      <button class="back-btn" @click="router.back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
        {{ t('publicCasesDetail.back') }}
      </button>

      <!-- Loading -->
      <div v-if="loading" class="skeleton-detail">
        <div class="skeleton-line skeleton-title" />
        <div class="skeleton-line skeleton-sub" />
        <div class="skeleton-line" />
        <div class="skeleton-line" />
      </div>

      <!-- Auth -->
      <div v-else-if="needsAuth" class="empty-state">
        <p>{{ t('publicCasesDetail.loginRequired') }}</p>
        <RouterLink to="/login" class="btn-login">{{ t('nav.login') }}</RouterLink>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="empty-state">
        <p>{{ error }}</p>
        <button class="btn-retry" @click="router.back()">{{ t('publicCasesDetail.back') }}</button>
      </div>

      <!-- Detail -->
      <div v-else-if="detail" class="detail-card">
        <div class="detail-header">
          <span class="badge" :data-status="detail.status">
            {{ statusLabel[detail.status] || detail.status }}
          </span>
          <h1 class="detail-id">#{{ detail.id }}</h1>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.sourceCase') }}</span>
            <span class="meta-value">#{{ detail.sourceCaseId }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.workspaceId') }}</span>
            <span class="meta-value">{{ detail.workspaceId }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.authorId') }}</span>
            <span class="meta-value">{{ detail.authorId }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.createdAt') }}</span>
            <span class="meta-value">{{ new Date(detail.gmtCreate).toLocaleString() }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.updatedAt') }}</span>
            <span class="meta-value">{{ new Date(detail.gmtModified).toLocaleString() }}</span>
          </div>
          <div v-if="detail.redactionStatus" class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.redactionStatus') }}</span>
            <span class="meta-value">{{ detail.redactionStatus }}</span>
          </div>
          <div v-if="detail.reviewId" class="meta-item">
            <span class="meta-label">{{ t('publicCasesDetail.reviewId') }}</span>
            <span class="meta-value">{{ detail.reviewId }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-8) 0 var(--space-16);
}

.container {
  max-width: 720px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.back-btn:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-hover);
}

.skeleton-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-8);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: var(--radius);
}

.skeleton-title { height: 32px; width: 40%; }
.skeleton-sub { height: 20px; width: 60%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-16);
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.btn-login {
  display: inline-flex;
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
}

.btn-retry {
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.detail-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.detail-id {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.badge[data-status="candidate"] { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.badge[data-status="reviewing"] { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.badge[data-status="verified"] { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.badge[data-status="stable"] { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.badge[data-status="canonical"] { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.badge[data-status="archived"] { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-full);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-5);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.meta-value {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}
</style>
