<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicCaseApi } from '@/api/publicCase'
import type { PublicCaseDetailVO, PublicCaseStatus } from '@/types'

const { t } = useI18n()

const cases = ref<PublicCaseDetailVO[]>([])
const loading = ref(true)

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
    const res = await publicCaseApi.list({ limit: 50 })
    if (res.data.code === 0 && res.data.data) {
      cases.value = res.data.data
    }
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">{{ t('publicCases.title') }}</h1>
        <p class="page-sub">{{ t('publicCases.subtitle') }}</p>
      </header>

      <div v-if="loading" class="skeleton-grid">
        <div v-for="i in 6" :key="i" class="skeleton-card" />
      </div>

      <div v-else-if="cases.length === 0" class="empty-state">
        <p>{{ t('publicCases.empty') }}</p>
      </div>

      <div v-else class="cases-grid">
        <div v-for="c in cases" :key="c.id" class="case-card">
          <div class="case-header">
            <span class="badge" :data-status="c.status">
              {{ statusLabel[c.status] || c.status }}
            </span>
            <span class="case-date">
              {{ new Date(c.gmtCreate).toLocaleDateString() }}
            </span>
          </div>
          <div class="case-id">
            <span class="case-label">ID</span>
            <span class="case-value">#{{ c.id }}</span>
          </div>
          <div class="case-meta">
            <span>{{ t('publicCases.source') }}: {{ c.sourceCaseId }}</span>
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
  max-width: 960px;
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.page-sub {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.skeleton-card {
  height: 140px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.case-card {
  padding: var(--space-5);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.case-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.badge {
  font-size: var(--text-xs);
  font-weight: 500;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.badge[data-status="verified"] { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge[data-status="stable"] { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.badge[data-status="canonical"] { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.badge[data-status="reviewing"] { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.badge[data-status="candidate"] { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
.badge[data-status="archived"] { background: rgba(71, 85, 105, 0.15); color: #475569; }

.case-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.case-id {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.case-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.case-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.case-meta {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
</style>
