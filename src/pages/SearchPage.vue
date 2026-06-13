<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { searchApi } from '@/api/search'
import type { SearchResponseVO, SearchResultItemVO } from '@/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const query = ref((route.query.q as string) || '')
const results = ref<SearchResponseVO | null>(null)
const loading = ref(false)
const needsAuth = ref(false)

onMounted(() => {
  if (query.value) doSearch()
})

watch(() => route.query.q, (q) => {
  query.value = (q as string) || ''
  needsAuth.value = false
  if (query.value) doSearch()
})

async function doSearch() {
  if (!query.value.trim()) return
  loading.value = true
  needsAuth.value = false
  try {
    const res = await searchApi.search({ query: query.value.trim(), limit: 20 })
    if (res.data.code === 0 && res.data.data) {
      results.value = res.data.data
    } else if (res.data.code === 401 || res.data.code === 403) {
      needsAuth.value = true
    }
  } catch (e: any) {
    if (e.response?.status === 401 || e.response?.status === 403) {
      needsAuth.value = true
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  router.push({ name: 'search', query: { q: query.value } })
}

function formatScore(score: number | null) {
  if (score === null) return ''
  return `${(score * 100).toFixed(0)}%`
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">{{ t('search.title') }}</h1>

        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="query"
            type="search"
            class="search-input"
            :placeholder="t('search.placeholder')"
            @keydown.enter="handleSearch"
          />
          <button class="search-btn" @click="handleSearch">
            {{ t('search.btn') }}
          </button>
        </div>
      </header>

      <div v-if="loading" class="skeleton-list">
        <div v-for="i in 5" :key="i" class="skeleton-card" />
      </div>

      <div v-else-if="needsAuth" class="empty-state">
        <p>{{ t('search.loginRequired') }}</p>
        <RouterLink to="/login" class="btn-login">{{ t('nav.login') }}</RouterLink>
      </div>

      <div v-else-if="results">
        <p class="results-count">
          {{ t('search.found', { count: results.totalHits }) }}
        </p>

        <div v-if="results.empty" class="empty-state">
          <p>{{ results.emptyReason || t('search.noResults') }}</p>
          <p v-if="results.candidateSeedCreated" class="seed-hint">
            {{ t('search.seedCreated') }}
          </p>
        </div>

        <div v-else class="results-list">
          <div
            v-for="(item, idx) in results.items"
            :key="idx"
            class="result-card"
          >
            <div class="result-header">
              <span class="result-title">{{ item.title || t('search.untitled') }}</span>
              <span v-if="item.score" class="result-score">
                {{ formatScore(item.score) }}
              </span>
            </div>
            <p v-if="item.summary" class="result-summary">{{ item.summary }}</p>
            <div class="result-tags">
              <span v-if="item.domain" class="tag">{{ item.domain }}</span>
              <span v-if="item.techStack" class="tag">{{ item.techStack }}</span>
              <span v-if="item.verificationLevel" class="tag tag-blue">
                {{ item.verificationLevel }}
              </span>
              <span v-if="item.riskLevel" class="tag tag-orange">
                {{ item.riskLevel }}
              </span>
            </div>
            <p v-if="item.scoreReason" class="result-reason">
              {{ item.scoreReason }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>{{ t('search.prompt') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: var(--space-8) 0 var(--space-16);
}

.container {
  max-width: 800px;
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-5);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: border-color var(--transition-fast);
}

.search-box:focus-within {
  border-color: var(--color-primary);
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  flex: 1;
  padding: var(--space-4) var(--space-4) var(--space-4) 44px;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
}

.search-btn {
  padding: var(--space-2) var(--space-5);
  margin-right: var(--space-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton-card {
  height: 120px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-xl);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.results-count {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.seed-hint {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-success);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.result-card {
  padding: var(--space-5);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: border-color var(--transition-fast);
}

.result-card:hover {
  border-color: var(--color-border-hover);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.result-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.result-score {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.result-summary {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.tag {
  font-size: var(--text-xs);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.tag-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tag-orange {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.result-reason {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-style: italic;
}

.btn-login {
  display: inline-flex;
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
}
</style>
