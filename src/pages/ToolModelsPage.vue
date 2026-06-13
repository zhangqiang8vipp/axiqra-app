<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { toolModelApi } from '@/api/toolModel'
import type { ToolModelLeaderboardVO } from '@/types'

const { t } = useI18n()

const tools = ref<ToolModelLeaderboardVO[]>([])
const loading = ref(true)
const needsAuth = ref(false)
const scopeType = ref('global')
const toolNameFilter = ref('')

const scopeOptions = [
  { value: 'global', label: 'Global' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'enterprise', label: 'Enterprise' },
]

onMounted(() => load())

async function load() {
  loading.value = true
  needsAuth.value = false
  try {
    const res = await toolModelApi.getLeaderboard({
      scopeType: scopeType.value,
      toolName: toolNameFilter.value || undefined,
      limit: 50,
    })
    if (res.data.code === 0 && res.data.data) {
      tools.value = res.data.data
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

function rankColor(rank: number) {
  if (rank === 1) return '#fbbf24'
  if (rank === 2) return '#94a3b8'
  if (rank === 3) return '#cd7c3b'
  return null
}
</script>

<template>
  <div class="page">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">{{ t('leaderboard.title') }}</h1>
        <p class="page-sub">{{ t('leaderboard.subtitle') }}</p>
      </header>

      <div class="filters">
        <select v-model="scopeType" class="filter-select" @change="load">
          <option v-for="opt in scopeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <input
          v-model="toolNameFilter"
          type="search"
          class="filter-input"
          :placeholder="t('leaderboard.filterPlaceholder')"
          @keydown.enter="load"
        />
        <button class="btn-filter" @click="load">
          {{ t('leaderboard.search') }}
        </button>
      </div>

      <div v-if="loading" class="skeleton-table">
        <div v-for="i in 10" :key="i" class="skeleton-row" />
      </div>

      <div v-else-if="needsAuth" class="empty-state">
        <p>{{ t('leaderboard.loginRequired') }}</p>
        <RouterLink to="/login" class="btn-login">{{ t('nav.login') }}</RouterLink>
      </div>

      <div v-else-if="tools.length === 0" class="empty-state">
        <p>{{ t('leaderboard.empty') }}</p>
      </div>

      <div v-else class="leaderboard-table">
        <div class="table-header">
          <span class="col-rank">#</span>
          <span class="col-tool">Tool</span>
          <span class="col-model">Model</span>
          <span class="col-domain">Domain</span>
          <span class="col-rate">7d Success Rate</span>
          <span class="col-samples">Samples</span>
        </div>
        <div
          v-for="tool in tools"
          :key="`${tool.toolName}-${tool.reportedModelName}`"
          class="table-row"
        >
          <span class="col-rank">
            <span
              v-if="rankColor(tool.rank)"
              class="rank-medal"
              :style="{ background: rankColor(tool.rank) }"
            >
              {{ tool.rank }}
            </span>
            <span v-else class="rank-num">{{ tool.rank }}</span>
          </span>
          <span class="col-tool tool-name">{{ tool.toolName }}</span>
          <span class="col-model model-name">{{ tool.reportedModelName }}</span>
          <span class="col-domain">{{ tool.domain || '—' }}</span>
          <span class="col-rate">
            <span class="rate-bar">
              <span
                class="rate-fill"
                :style="{ width: `${Math.round(tool.successRate7d * 100)}%` }"
              />
            </span>
            <span class="rate-pct">{{ (tool.successRate7d * 100).toFixed(1) }}%</span>
          </span>
          <span class="col-samples">{{ tool.sampleSize.toLocaleString() }}</span>
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
  max-width: 1100px;
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

.filters {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-filter {
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-filter:hover {
  background: var(--color-primary-hover);
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-row {
  height: 52px;
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

.leaderboard-table {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 1.2fr 1fr 140px 90px;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 1.2fr 1fr 140px 90px;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  font-size: var(--text-sm);
  transition: background var(--transition-fast);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-bg-secondary);
}

.rank-medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: var(--text-xs);
  color: #fff;
}

.rank-num {
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.tool-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.model-name {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.col-domain {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
}

.col-rate {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.rate-bar {
  flex: 1;
  height: 6px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.rate-fill {
  display: block;
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.rate-pct {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  min-width: 40px;
}

.col-samples {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  text-align: right;
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
